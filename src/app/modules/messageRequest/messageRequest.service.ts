import { Types } from 'mongoose';
import { IPaginationOptions, TImage } from '../../interfaces/common';
import { MessageRequest } from './messageRequest.model';
import { TeacherResponse } from '../teacherResponse/teacherResponse.model';
import { User } from '../user/user.model';
import { Teacher } from '../teacher/teacher.model';
import { Student } from '../student/student.model';
import { Conversation } from '../conversation/convesation.model';
import { Message } from '../message/message.model';
import AppError from '../../classes/errorClasses/AppError';
import { StatusCodes } from 'http-status-codes';
import { calculatePagination } from '../../helpers/pagenationHelper';
import { NotificationService } from '../chatNotification/notification.service';
import { emitToRole, emitToUser } from '../../utils/socketManager';
import { USER_ROLE } from '../user/user.constant';

// Create a new message request (broadcast)
const createMessageRequest = async (
    studentId: string,
    initialMessage: string,
    attachments: TImage[] = []
) => {
    // Check if the student exists
    const student = await User.findById(studentId);
    if (!student || student.role !== USER_ROLE.student) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid student ID');
    }

    // Get student name if possible
    const studentInfo = await Student.findOne({ user_id: studentId }).select('name').lean();
    const studentName = studentInfo?.name || 'a student';

    // Create the message request
    const messageRequest = await MessageRequest.create({
        studentId: new Types.ObjectId(studentId),
        initialMessage,
        attachments,
        status: 'pending',
    });

    // Find all active teachers
    const activeTeachers = await Teacher.find({})
        .populate({
            path: 'user_id',
            select: '_id status',
            match: { status: 'active' }, // Only active teachers
        })
        .exec();

    // Filter out teachers whose user_id is null (due to the match condition)
    const validTeachers = activeTeachers.filter(teacher => teacher.user_id);

    if (validTeachers.length === 0) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'No active teachers available');
    }

    // Create teacher responses for all teachers
    const teacherResponses = validTeachers.map(teacher => ({
        messageRequestId: messageRequest._id,
        teacherId: teacher.user_id._id,
        status: 'pending',
    }));

    await TeacherResponse.insertMany(teacherResponses);

    // Populate student data for the notification
    await messageRequest.populate({
        path: 'studentId',
        select: '_id',
    });

    // Send notifications to all teachers
    for (const teacher of validTeachers) {
        await NotificationService.createNotification({
            userId: teacher.user_id._id,
            type: 'message_request',
            content: `New message request from ${studentName}`,
            referenceId: messageRequest._id,
            isRead: false,
        });
    }

    // Emit socket event to all teachers
    emitToRole(USER_ROLE.teacher, 'new_message_request', {
        messageRequest,
    });

    return messageRequest;
};

// Get pending message requests for a teacher
const getPendingMessageRequestsForTeacher = async (
    teacherId: string,
    paginationOptions: IPaginationOptions
) => {
    // Check if the teacher exists
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== USER_ROLE.teacher) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid teacher ID');
    }

    // Calculate pagination
    const { page, limit, skip } = calculatePagination(paginationOptions);

    // Find all teacher responses for this teacher with pending status
    const teacherResponses = await TeacherResponse.find({
        teacherId: new Types.ObjectId(teacherId),
        status: 'pending',
    })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate({
            path: 'messageRequestId',
            populate: {
                path: 'studentId',
                select: 'name _id',
            },
        });

    // Count total pending requests
    const total = await TeacherResponse.countDocuments({
        teacherId: new Types.ObjectId(teacherId),
        status: 'pending',
    });

    return {
        meta: {
            page,
            limit,
            total,
        },
        data: teacherResponses.map(response => response.messageRequestId),
    };
};

// Accept a message request
const acceptMessageRequest = async (teacherId: string, messageRequestId: string) => {
    // Check if the teacher exists
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== USER_ROLE.teacher) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid teacher ID');
    }

    // Check if the message request exists and is still pending
    const messageRequest = await MessageRequest.findOne({
        _id: messageRequestId,
        status: 'pending',
    }).populate('studentId', '_id');

    if (!messageRequest) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Message request not found or already processed');
    }

    // Check if this teacher has a pending response for this request
    const teacherResponse = await TeacherResponse.findOne({
        messageRequestId: new Types.ObjectId(messageRequestId),
        teacherId: new Types.ObjectId(teacherId),
        status: 'pending',
    });

    if (!teacherResponse) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'You do not have access to this message request');
    }

    // Begin a transaction
    const session = await MessageRequest.startSession();
    session.startTransaction();

    try {
        // Mark the message request as accepted
        const updatedRequest = await MessageRequest.findByIdAndUpdate(
            messageRequestId,
            {
                status: 'accepted',
                acceptedBy: new Types.ObjectId(teacherId),
            },
            { new: true, session }
        );

        // Mark this teacher's response as accepted
        await TeacherResponse.findByIdAndUpdate(
            teacherResponse._id,
            { status: 'accepted' },
            { session }
        );

        // Mark all other teacher responses as declined
        await TeacherResponse.updateMany(
            {
                messageRequestId: new Types.ObjectId(messageRequestId),
                teacherId: { $ne: new Types.ObjectId(teacherId) },
            },
            { status: 'declined' },
            { session }
        );

        // Create a conversation between the student and teacher
        const conversation = await Conversation.create(
            [{
                participants: [
                    { userId: messageRequest.studentId._id, unreadCount: 0 },
                    { userId: new Types.ObjectId(teacherId), unreadCount: 0 },
                ],
            }],
            { session }
        );

        // Add the initial message to the conversation
        const message = await Message.create(
            [{
                senderId: messageRequest.studentId._id,
                conversationId: conversation[0]._id,
                content: messageRequest.initialMessage,
                attachments: messageRequest.attachments || [],
            }],
            { session }
        );

        // Update the conversation with the last message
        await Conversation.findByIdAndUpdate(
            conversation[0]._id,
            {
                lastMessage: message[0]._id,
                lastMessageText: messageRequest.initialMessage,
                lastMessageTime: message[0].createdAt,
                $inc: {
                    'participants.$[teacher].unreadCount': 1,
                },
            },
            {
                arrayFilters: [{ 'teacher.userId': new Types.ObjectId(teacherId) }],
                session,
            }
        );

        // Notify the student that their request was accepted
        const studentNotification = await NotificationService.createNotification({
            userId: messageRequest.studentId._id,
            type: 'message_request_accepted',
            content: `Your message has been accepted by a teacher`,
            referenceId: conversation[0]._id, // Reference the conversation
            isRead: false,
        }, session);

        // Commit the transaction
        await session.commitTransaction();

        // Emit socket event to the student
        emitToUser(messageRequest.studentId._id.toString(), 'message_request_accepted', {
            conversation: conversation[0],
            message: message[0],
            notification: studentNotification
        });

        // Emit socket event to all teachers to remove this request from their list
        emitToRole(USER_ROLE.teacher, 'message_request_processed', {
            messageRequestId,
        });

        return {
            conversation: conversation[0],
            message: message[0],
        };
    } catch (error) {
        // Abort the transaction on error
        await session.abortTransaction();
        throw error;
    } finally {
        // End the session
        session.endSession();
    }
};

// Decline a message request
const declineMessageRequest = async (teacherId: string, messageRequestId: string) => {
    // Check if the teacher exists
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== USER_ROLE.teacher) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid teacher ID');
    }

    // Check if the teacher has a pending response for this request
    const teacherResponse = await TeacherResponse.findOne({
        messageRequestId: new Types.ObjectId(messageRequestId),
        teacherId: new Types.ObjectId(teacherId),
        status: 'pending',
    });

    if (!teacherResponse) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'You do not have access to this message request or it has already been processed'
        );
    }

    // Get message request to check student ID
    const messageRequest = await MessageRequest.findById(messageRequestId);
    if (!messageRequest) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Message request not found');
    }

    // Mark this teacher's response as declined
    await TeacherResponse.findByIdAndUpdate(
        teacherResponse._id,
        { status: 'declined' }
    );

    // Check if all teachers have declined this request
    const pendingResponses = await TeacherResponse.countDocuments({
        messageRequestId: new Types.ObjectId(messageRequestId),
        status: 'pending',
    });

    let allDeclined = false;

    // If no pending responses remain, mark the message request as closed
    if (pendingResponses === 0) {
        await MessageRequest.findByIdAndUpdate(
            messageRequestId,
            { status: 'closed' }
        );

        allDeclined = true;

        // Notify the student that all teachers declined their request
        await NotificationService.createNotification({
            userId: messageRequest.studentId,
            type: 'message_request_declined',
            content: `All teachers have declined your message request`,
            referenceId: messageRequest._id,
            isRead: false,
        });

        // Emit socket event to the student
        emitToUser(messageRequest.studentId.toString(), 'message_request_all_declined', {
            messageRequestId,
        });
    }

    return {
        success: true,
        allDeclined,
        studentId: messageRequest.studentId
    };
};

export const MessageRequestService = {
    createMessageRequest,
    getPendingMessageRequestsForTeacher,
    acceptMessageRequest,
    declineMessageRequest,
};
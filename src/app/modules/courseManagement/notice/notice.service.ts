/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes';
import AppError from '../../../classes/errorClasses/AppError';
import { Course } from '../course/course.model';
import { INotice, TCreateNoticePayload } from './notice.interface';
import { Notice } from './notice.model';
import { EnrolledCourse } from '../../enrolledCourse/enrolledCourse.model';
import { Types } from 'mongoose';
import { socketHandler } from '../../../../server';

// Create Notice
const createNotice = async (payload: TCreateNoticePayload) => {
    const { course_id, notices } = payload;
    // Check if the course exists
    const courseExists = await Course.findById(course_id);

    if (!courseExists) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Course does not exist!');
    }
    // checking whether notice is empty
    if (notices.length === 0) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Empty notice data');
    }

    // Create multiple lesson documents in a single operation
    const newNotice = await Notice.insertMany(
        notices.map((n) => ({
            course_id,
            notice: n!.notice,
            // noticeId: l!.noticeId,
        })),
    );

    // **********Send notification
    const enrolledStudents = await EnrolledCourse.find({
        course_id,
    }).populate<{
        student_id: {
            _id: Types.ObjectId;
            user_id: string;
            subscriptionEndDate: Date;
        };
    }>({
        path: 'student_id',
        select: 'user_id subscriptionEndDate',
    });

    const notification = notices
        .map((n, index) => `${index + 1}. ${n.notice}`)
        .join(' | ');

    for (const student of enrolledStudents) {
        const studentData = {
            user_id: student.student_id.user_id,
            subscriptionEndDate: student.student_id.subscriptionEndDate,
        };
        const courseData = { name: courseExists.name };

        if (socketHandler) {
            socketHandler.emitCourseNoticeNotification(
                studentData,
                courseData,
                notification,
            );
        }
    }

    return newNotice;
};

// GEt all assignments of a Course with Lesson name
const getAllNoticesByCourseId = async (courseId: string) => {
    // Check if the course exist
    const isCourseExist = await Course.findById(courseId);
    if (!isCourseExist) {
        throw new AppError(
            StatusCodes.NOT_FOUND,
            'Course does not exist with this ID',
        );
    }

    const notices = await Notice.find({
        course_id: courseId,
    });
    return notices;
};

// Get All Notices
const getAllNotices = async () => {
    // Get all courses
    const notices = await Notice.find({});

    return notices;
};

// Get Notice By ID
const getNoticeByID = async (noticeId: string) => {
    const notice = await Notice.findById(noticeId);

    if (!notice) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Notice not found');
    }

    return notice;
};

// Update Notice
const updateNotice = async (noticeId: string, payload: INotice) => {
    // Check if there are fields to update
    if (Object.keys(payload).length === 0) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'No valid fields provided for update',
        );
    }

    // Create the updated payload
    const updatedPayload: Partial<INotice> = {
        ...(payload.notice && { notice: payload.notice }),
    };

    // Update the course
    const result = await Notice.findByIdAndUpdate(noticeId, updatedPayload, {
        new: true,
        runValidators: true,
    });

    return result;
};

// Delete Notice By ID
const deleteNoticeByID = async (noticeId: string) => {
    // Check if the notice exists
    const existingNotice = await Notice.findById(noticeId);
    if (!existingNotice) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Notice not found');
    }

    // Delete the notice from the database
    await Notice.findByIdAndDelete(noticeId);

    return null;
};

export const noticeService = {
    createNotice,
    getAllNoticesByCourseId,
    getAllNotices,
    getNoticeByID,
    updateNotice,
    deleteNoticeByID,
};

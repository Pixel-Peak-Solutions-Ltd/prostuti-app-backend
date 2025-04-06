import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { MessageRequestService } from './messageRequest.service';
import sendSuccessResponse from '../../utils/sendSuccessResponse';
import { StatusCodes } from 'http-status-codes';
import pick from '../../helpers/pick';
import { paginationFields } from '../../constant';
import config from '../../config';
import { uploadToB2 } from '../../utils/backBlaze';

// Create a new message request (broadcast to all teachers)
const createMessageRequest = catchAsync(async (req: Request, res: Response) => {
    const { content } = req.body;
    const studentId = req.user.userId;

    let attachments = [];

    // Handle file uploads if any
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        // Upload files to Backblaze
        const uploadPromises = req.files.map((file) =>
            uploadToB2(
                file,
                config.backblaze_all_users_bucket_name,
                config.backblaze_all_users_bucket_id,
                'message-attachments'
            )
        );

        attachments = await Promise.all(uploadPromises);
    }

    const result = await MessageRequestService.createMessageRequest(
        studentId,
        content,
        attachments
    );

    sendSuccessResponse(res, {
        statusCode: StatusCodes.CREATED,
        message: 'Message request sent to all teachers',
        data: result,
    });
});

// Get pending message requests for a teacher
const getPendingMessageRequests = catchAsync(async (req: Request, res: Response) => {
    const teacherId = req.user.userId;
    const paginationOptions = pick(req.query, paginationFields);

    const result = await MessageRequestService.getPendingMessageRequestsForTeacher(
        teacherId,
        paginationOptions
    );

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Pending message requests retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
});

// Accept a message request
const acceptMessageRequest = catchAsync(async (req: Request, res: Response) => {
    const { messageRequestId } = req.params;
    const teacherId = req.user.userId;

    const result = await MessageRequestService.acceptMessageRequest(
        teacherId,
        messageRequestId
    );

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Message request accepted successfully',
        data: result,
    });
});

// Decline a message request
const declineMessageRequest = catchAsync(async (req: Request, res: Response) => {
    const { messageRequestId } = req.params;
    const teacherId = req.user.userId;

    const result = await MessageRequestService.declineMessageRequest(
        teacherId,
        messageRequestId
    );

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Message request declined',
        data: result,
    });
});

export const MessageRequestController = {
    createMessageRequest,
    getPendingMessageRequests,
    acceptMessageRequest,
    declineMessageRequest,
};
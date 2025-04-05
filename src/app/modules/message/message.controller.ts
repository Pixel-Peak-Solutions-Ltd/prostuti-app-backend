import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { MessageService } from './message.service';
import sendSuccessResponse from '../../utils/sendSuccessResponse';
import { StatusCodes } from 'http-status-codes';
import config from '../../config';
import { uploadToB2 } from '../../utils/backBlaze';
import pick from '../../helpers/pick';
import { paginationFields } from '../../constant';

const sendMessage = catchAsync(async (req: Request, res: Response) => {
    const { conversationId, content } = req.body;
    const userId = req.user.userId;

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

    const result = await MessageService.sendMessage(
        userId,
        conversationId,
        content,
        attachments
    );

    sendSuccessResponse(res, {
        statusCode: StatusCodes.CREATED,
        message: 'Message sent successfully',
        data: result,
    });
});

const getMessages = catchAsync(async (req: Request, res: Response) => {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    const paginationOptions = pick(req.query, paginationFields);

    const result = await MessageService.getMessages(
        userId,
        conversationId,
        paginationOptions
    );

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Messages retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
});

export const MessageController = {
    sendMessage,
    getMessages,
};
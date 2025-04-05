import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { ConversationService } from './conversation.service';
import sendSuccessResponse from '../../utils/sendSuccessResponse';
import { StatusCodes } from 'http-status-codes';
import pick from '../../helpers/pick';
import { paginationFields } from '../../constant';


const createConversation = catchAsync(async (req: Request, res: Response) => {
    const { receiverId } = req.body;
    const userId = req.user.userId;

    const result = await ConversationService.createConversation(
        userId,
        receiverId
    );

    sendSuccessResponse(res, {
        statusCode: StatusCodes.CREATED,
        message: 'Conversation created successfully',
        data: result,
    });
});

const getConversations = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.userId;

    const paginationOptions = pick(req.query, paginationFields);

    const result = await ConversationService.getConversations(
        userId,
        paginationOptions
    );

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Conversations retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
});

const getConversation = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await ConversationService.getConversation(userId, id);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Conversation retrieved successfully',
        data: result,
    });
});

const markConversationAsRead = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await ConversationService.markConversationAsRead(userId, id);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Conversation marked as read',
        data: result,
    });
});

export const ConversationController = {
    createConversation,
    getConversations,
    getConversation,
    markConversationAsRead,
};
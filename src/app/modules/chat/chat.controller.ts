import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendSuccessResponse from '../../utils/sendSuccessResponse';
import { chatService } from './chat.service';
import { IChatFilters } from './chat.interface';

/**
 * Create a new broadcast request
 */
const createBroadcastRequest = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.user;
    const { message, subject } = req.body;

    const result = await chatService.createBroadcastRequest(
        userId,
        message,
        subject
    );

    sendSuccessResponse(res, {
        statusCode: StatusCodes.CREATED,
        message: 'Broadcast request created successfully',
        data: result,
    });
});

/**
 * Get pending broadcast requests for teachers
 */
const getPendingBroadcastRequests = catchAsync(async (req: Request, res: Response) => {
    const result = await chatService.getPendingBroadcastRequests();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Pending broadcast requests retrieved successfully',
        data: result,
    });
});

/**
 * Accept a broadcast request
 */
const acceptBroadcastRequest = catchAsync(async (req: Request, res: Response) => {
    console.log('Params:', req.params);
    const { userId } = req.user;
    const { broadcastId } = req.params;

    const result = await chatService.acceptBroadcastRequest(
        broadcastId,
        userId
    );

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Broadcast request accepted successfully',
        data: result,
    });
});

/**
 * Decline a broadcast request
 */
const declineBroadcastRequest = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.user;
    const { broadcastId } = req.params;

    const result = await chatService.declineBroadcastRequest(
        broadcastId,
        userId
    );

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Broadcast request declined successfully',
        data: result,
    });
});

/**
 * Get active conversations for a user
 */
const getActiveConversations = catchAsync(async (req: Request, res: Response) => {
    const { userId, role } = req.user;

    const result = await chatService.getActiveConversations(userId, role);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Active conversations retrieved successfully',
        data: result,
    });
});

/**
 * Get chat history for a conversation
 */
const getChatHistory = catchAsync(async (req: Request, res: Response) => {
    const filters: IChatFilters = {
        conversation_id: req.query.conversation_id as string,
        sender_id: req.query.sender_id as string,
        recipient_id: req.query.recipient_id as string,
        page: Number(req.query.page) || undefined,
        limit: Number(req.query.limit) || undefined,
    };

    const result = await chatService.getChatHistory(filters);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Chat history retrieved successfully',
        data: result,
    });
});

/**
 * Mark messages as read
 */
const markMessagesAsRead = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.user;
    const { conversation_id } = req.params;

    const result = await chatService.markMessagesAsRead(
        conversation_id,
        userId
    );

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Messages marked as read successfully',
        data: { updatedCount: result },
    });
});

/**
 * Get unread message count
 */
const getUnreadMessageCount = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.user;

    const result = await chatService.getUnreadMessageCount(userId);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Unread message count retrieved successfully',
        data: result,
    });
});

/**
 * Get student's active broadcast requests
 */
const getStudentActiveBroadcasts = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.user;

    const result = await chatService.getStudentActiveBroadcasts(userId);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Active broadcast requests retrieved successfully',
        data: result,
    });
});

export const chatController = {
    createBroadcastRequest,
    getPendingBroadcastRequests,
    acceptBroadcastRequest,
    declineBroadcastRequest,
    getActiveConversations,
    getChatHistory,
    markMessagesAsRead,
    getUnreadMessageCount,
    getStudentActiveBroadcasts,
};
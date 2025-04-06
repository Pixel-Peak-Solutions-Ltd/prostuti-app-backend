import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { NotificationService } from './notification.service';
import sendSuccessResponse from '../../utils/sendSuccessResponse';
import { StatusCodes } from 'http-status-codes';
import pick from '../../helpers/pick';
import { paginationFields } from '../../constant';

// Get notifications for the authenticated user
const getNotifications = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.userId;
    const paginationOptions = pick(req.query, paginationFields);

    const result = await NotificationService.getNotificationsForUser(
        userId,
        paginationOptions
    );

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Notifications retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
});

// Get unread notification count
const getUnreadCount = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.userId;

    const count = await NotificationService.getUnreadNotificationCount(userId);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Unread notification count retrieved successfully',
        data: { count },
    });
});

// Mark a notification as read
const markAsRead = catchAsync(async (req: Request, res: Response) => {
    const { notificationId } = req.params;
    const userId = req.user.userId;

    const result = await NotificationService.markNotificationAsRead(
        notificationId,
        userId
    );

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Notification marked as read',
        data: result,
    });
});

// Mark all notifications as read
const markAllAsRead = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.userId;

    const result = await NotificationService.markAllNotificationsAsRead(userId);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'All notifications marked as read',
        data: result,
    });
});

export const NotificationController = {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
};
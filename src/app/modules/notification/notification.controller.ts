import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendSuccessResponse from '../../utils/sendSuccessResponse';
import { notificationService } from './notification.service';
import pick from '../../helpers/pick';
import { paginationFields } from '../../constant';
import { NotificationFilterableFields } from './notification.constant';

// Create a notification
const createNotification = catchAsync(async (req: Request, res: Response) => {
    const result = await notificationService.createNotification(req.user, req.body);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.CREATED,
        message: 'Notification created successfully',
        data: result,
    });
});

// Get notifications for the current user
const getMyNotifications = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, NotificationFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);

    const result = await notificationService.getMyNotifications(
        req.user,
        filters,
        paginationOptions
    );

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Notifications retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
});

// Mark a notification as read
const markAsRead = catchAsync(async (req: Request, res: Response) => {
    const { notificationId } = req.params;

    const result = await notificationService.markAsRead(req.user, notificationId);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Notification marked as read',
        data: result,
    });
});

// Mark all notifications as read
const markAllAsRead = catchAsync(async (req: Request, res: Response) => {
    const result = await notificationService.markAllAsRead(req.user);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: `${result.count} notification(s) marked as read`,
        data: result,
    });
});

// Get unread notification count
const getUnreadCount = catchAsync(async (req: Request, res: Response) => {
    const result = await notificationService.getUnreadCount(req.user);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Unread notification count retrieved successfully',
        data: result,
    });
});

export const notificationController = {
    createNotification,
    getMyNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount
};
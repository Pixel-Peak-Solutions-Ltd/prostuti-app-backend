import { ClientSession, Types } from 'mongoose';
import { Notification } from './notification.model';
import { INotification, NotificationType } from './notification.interface';
import { IPaginationOptions } from '../../interfaces/common';
import { calculatePagination } from '../../helpers/pagenationHelper';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../classes/errorClasses/AppError';

interface INotificationPayload {
    userId: Types.ObjectId | string;
    type: NotificationType;
    content: string;
    referenceId?: Types.ObjectId | string;
    isRead?: boolean;
}

const createNotification = async (
    payload: INotificationPayload,
    session?: ClientSession
): Promise<INotification> => {
    // Convert string IDs to ObjectIds if needed
    const notificationData = {
        ...payload,
        userId: typeof payload.userId === 'string'
            ? new Types.ObjectId(payload.userId)
            : payload.userId,
        referenceId: payload.referenceId && typeof payload.referenceId === 'string'
            ? new Types.ObjectId(payload.referenceId)
            : payload.referenceId,
    };

    // Create notification with or without session
    if (session) {
        return (await Notification.create([notificationData], { session }))[0];
    } else {
        return await Notification.create(notificationData);
    }
};

const getNotificationsForUser = async (
    userId: string,
    paginationOptions: IPaginationOptions
) => {
    // Calculate pagination
    const { page, limit, skip, sortBy, sortOrder } =
        calculatePagination(paginationOptions);

    // Get notifications
    const notifications = await Notification.find({
        userId: new Types.ObjectId(userId)
    })
        .sort({ createdAt: -1 }) // Most recent first
        .skip(skip)
        .limit(limit);

    // Count total
    const total = await Notification.countDocuments({
        userId: new Types.ObjectId(userId)
    });

    return {
        meta: {
            page,
            limit,
            total,
        },
        data: notifications,
    };
};

const getUnreadNotificationCount = async (userId: string): Promise<number> => {
    return await Notification.countDocuments({
        userId: new Types.ObjectId(userId),
        isRead: false
    });
};

const markNotificationAsRead = async (notificationId: string, userId: string) => {
    const notification = await Notification.findOneAndUpdate(
        {
            _id: notificationId,
            userId: new Types.ObjectId(userId)
        },
        { isRead: true },
        { new: true }
    );

    if (!notification) {
        throw new AppError(
            StatusCodes.NOT_FOUND,
            'Notification not found or not owned by this user'
        );
    }

    return notification;
};

const markAllNotificationsAsRead = async (userId: string) => {
    await Notification.updateMany(
        {
            userId: new Types.ObjectId(userId),
            isRead: false
        },
        { isRead: true }
    );

    return { success: true };
};

export const NotificationService = {
    createNotification,
    getNotificationsForUser,
    getUnreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead
};
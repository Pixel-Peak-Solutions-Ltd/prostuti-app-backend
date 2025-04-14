import { StatusCodes } from 'http-status-codes';
import { FilterQuery, SortOrder, Types } from 'mongoose';
import AppError from '../../classes/errorClasses/AppError';
import { TJWTDecodedUser } from '../../interfaces/jwt/jwt.type';
import { User } from '../user/user.model';
import { INotification, INotificationFilters } from './notification.interface';
import { Notification } from './notification.model';
import { calculatePagination } from '../../helpers/pagenationHelper';
import { IPaginationOptions } from '../../interfaces/common';
import { NotificationSearchableFields } from './notification.constant';

// Create a notification
const createNotification = async (
    userInfo: TJWTDecodedUser,
    payload: {
        recipientId: string;
        type: string;
        title: string;
        message: string;
        resourceType?: string;
        resourceId?: string;
        metaData?: Record<string, any>;
    }
): Promise<INotification> => {
    // Validate sender exists
    const sender = await User.findById(userInfo.userId);
    if (!sender) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Sender user not found');
    }

    // Validate recipient exists
    const recipient = await User.findById(payload.recipientId);
    if (!recipient) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Recipient user not found');
    }

    // Create notification
    const notification = await Notification.create({
        recipient: payload.recipientId,
        sender: userInfo.userId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        resourceType: payload.resourceType,
        resourceId: payload.resourceId,
        metaData: payload.metaData,
        isRead: false,
    });

    return notification;
};

// Get notifications for the current user

const getMyNotifications = async (
    userInfo: TJWTDecodedUser,
    filters: INotificationFilters,
    paginationOptions: IPaginationOptions
) => {
    const { searchTerm, isRead, type, resourceType, ...restFilters } = filters;
    const { page, limit, skip, sortBy, sortOrder } = calculatePagination(paginationOptions);

    const andConditions: FilterQuery<INotification>[] = [
        { recipient: new Types.ObjectId(userInfo.userId) }
    ];

    // Add search term condition
    if (searchTerm) {
        andConditions.push({
            $or: NotificationSearchableFields.map((field) => ({
                [field]: {
                    $regex: searchTerm,
                    $options: 'i',
                },
            })) as FilterQuery<INotification>[],
        });
    }

    // Add filters if provided
    if (isRead !== undefined) {
        andConditions.push({ isRead: isRead === 'true' } as FilterQuery<INotification>);
    }

    if (type) {
        andConditions.push({ type } as FilterQuery<INotification>);
    }

    if (resourceType) {
        andConditions.push({ resourceType } as FilterQuery<INotification>);
    }

    // Add remaining filters
    if (Object.keys(restFilters).length) {
        andConditions.push({
            $and: Object.entries(restFilters).map(([field, value]) => ({
                [field]: value,
            })) as FilterQuery<INotification>[],
        });
    }

    const sortConditions: { [key: string]: SortOrder } = {};
    if (sortBy && sortOrder) {
        sortConditions[sortBy] = sortOrder;
    } else {
        // Default sort by createdAt in descending order (newest first)
        sortConditions['createdAt'] = 'desc';
    }

    const whereConditions: FilterQuery<INotification> = { $and: andConditions };

    const count = await Notification.countDocuments(whereConditions);
    const notifications = await Notification.find(whereConditions)
        .sort(sortConditions)
        .skip(skip)
        .limit(limit)
        .populate('sender', 'role registeredId')
        .populate('recipient', 'role registeredId');

    return {
        meta: {
            page,
            limit: limit === 0 ? count : limit,
            count,
        },
        data: notifications,
    };
};

// Mark a notification as read
const markAsRead = async (
    userInfo: TJWTDecodedUser,
    notificationId: string
): Promise<INotification> => {
    const notification = await Notification.findOneAndUpdate(
        {
            _id: notificationId,
            recipient: userInfo.userId,
        },
        { isRead: true },
        { new: true }
    );

    if (!notification) {
        throw new AppError(
            StatusCodes.NOT_FOUND,
            'Notification not found or you do not have permission to mark it as read'
        );
    }

    return notification;
};

// Mark all notifications as read
const markAllAsRead = async (
    userInfo: TJWTDecodedUser
): Promise<{ count: number }> => {
    const result = await Notification.updateMany(
        {
            recipient: userInfo.userId,
            isRead: false,
        },
        { isRead: true }
    );

    return { count: result.modifiedCount };
};

// Get unread notification count
const getUnreadCount = async (
    userInfo: TJWTDecodedUser
): Promise<{ count: number }> => {
    const count = await Notification.countDocuments({
        recipient: userInfo.userId,
        isRead: false,
    });

    return { count };
};

export const notificationService = {
    createNotification,
    getMyNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount
};
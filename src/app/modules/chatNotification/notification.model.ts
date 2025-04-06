import { Schema, model } from 'mongoose';
import { INotification, NotificationModel } from './notification.interface';

const notificationSchema = new Schema<INotification, NotificationModel>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        type: {
            type: String,
            enum: ['message_request', 'message_request_accepted', 'message_request_declined', 'new_message'],
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        referenceId: {
            type: Schema.Types.ObjectId,
            default: null,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
        },
    }
);

// Index for faster queries of unread notifications for a user
notificationSchema.index({ userId: 1, isRead: 1 });
// Index for faster queries by type
notificationSchema.index({ userId: 1, type: 1 });

export const Notification = model<INotification, NotificationModel>('Notification', notificationSchema);
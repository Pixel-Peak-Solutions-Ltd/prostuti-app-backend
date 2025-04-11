import { Schema, model } from 'mongoose';
import { INotification, NotificationModel } from './notification.interface';

const NotificationSchema = new Schema<INotification, NotificationModel>(
    {
        recipient: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        sender: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        type: {
            type: String,
            enum: ['EditRequest', 'CourseApproved', 'General'],
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        resourceType: {
            type: String,
            trim: true,
        },
        resourceId: {
            type: Schema.Types.ObjectId,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        metaData: {
            type: Schema.Types.Mixed,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for efficient querying
NotificationSchema.index({ recipient: 1, isRead: 1 });
NotificationSchema.index({ resourceType: 1, resourceId: 1 });

export const Notification = model<INotification, NotificationModel>('Notification', NotificationSchema);
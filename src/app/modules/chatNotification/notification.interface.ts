import { Model, Types } from 'mongoose';

export type NotificationType =
    | 'message_request'
    | 'message_request_accepted'
    | 'message_request_declined'
    | 'new_message';

export interface INotification {
    _id?: Types.ObjectId;
    userId: Types.ObjectId;
    type: NotificationType;
    content: string;
    referenceId?: Types.ObjectId; // ID of related entity (message request, conversation, etc.)
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type NotificationModel = Model<INotification, Record<string, unknown>>;
import { Model, Types } from 'mongoose';
import { TImage } from '../../interfaces/common';

export interface IMessage {
    _id?: Types.ObjectId;
    senderId: Types.ObjectId;
    conversationId: Types.ObjectId;
    content: string;
    attachments?: TImage[];
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type MessageModel = Model<IMessage, Record<string, unknown>>;
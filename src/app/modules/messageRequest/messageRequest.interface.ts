import { Model, Types } from 'mongoose';
import { TImage } from '../../interfaces/common';

export interface IMessageRequest {
    _id?: Types.ObjectId;
    studentId: Types.ObjectId;
    initialMessage: string;
    status: 'pending' | 'accepted' | 'closed';
    attachments?: TImage[];
    acceptedBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export type MessageRequestModel = Model<IMessageRequest, Record<string, unknown>>;
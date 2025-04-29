import { Model, Types } from 'mongoose';

export type SenderRole = 'student' | 'teacher';
export type BroadcastStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface IChatMessage {
    _id?: Types.ObjectId;
    sender_id: Types.ObjectId;
    sender_role: SenderRole;
    recipient_id: Types.ObjectId;
    conversation_id: string;
    message: string;
    read: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IBroadcastRequest {
    _id?: Types.ObjectId;
    student_id: Types.ObjectId;
    message: string;
    subject: string;
    status: BroadcastStatus;
    accepted_by?: Types.ObjectId;
    conversation_id?: string;
    expiry_time: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

// Socket connection user information
export interface IConnectedUser {
    user_id: string;
    role: string;
    socket_id: string;
}

// Socket event payloads
export interface IBroadcastRequestPayload {
    message: string;
    subject: string;
}

export interface IAcceptBroadcastPayload {
    broadcast_id: string;
}

export interface IChatMessagePayload {
    conversation_id: string;
    message: string;
    recipient_id: string;
}

export interface IChatFilters {
    conversation_id?: string;
    sender_id?: string;
    recipient_id?: string;
    limit?: number;
    page?: number;
}

// Mongoose model types
export type ChatModel = Model<IChatMessage, Record<string, unknown>>;
export type BroadcastRequestModel = Model<IBroadcastRequest, Record<string, unknown>>;
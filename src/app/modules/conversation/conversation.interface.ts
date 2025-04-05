import { Model, Types } from 'mongoose';

export interface IParticipant {
    userId: Types.ObjectId;
    unreadCount: number;
    lastSeen?: Date;
}

export interface IConversation {
    _id?: Types.ObjectId;
    participants: IParticipant[];
    lastMessage?: Types.ObjectId;
    lastMessageText?: string;
    lastMessageTime?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export type ConversationModel = Model<IConversation, Record<string, unknown>>;
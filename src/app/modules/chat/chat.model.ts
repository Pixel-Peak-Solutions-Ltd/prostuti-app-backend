import { Schema, model } from 'mongoose';
import { IChatMessage, IBroadcastRequest, ChatModel, BroadcastRequestModel } from './chat.interface';

// Chat Message Schema
const chatMessageSchema = new Schema<IChatMessage, ChatModel>(
    {
        sender_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        sender_role: {
            type: String,
            enum: ['student', 'teacher'],
            required: true,
        },
        recipient_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        conversation_id: {
            type: String,
            required: true,
            index: true,
        },
        message: {
            type: String,
            required: true,
        },
        read: {
            type: Boolean,
            default: false,
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Broadcast Request Schema
const broadcastRequestSchema = new Schema<IBroadcastRequest, BroadcastRequestModel>(
    {
        student_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        subject: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'declined', 'expired'],
            default: 'pending',
        },
        accepted_by: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        conversation_id: {
            type: String,
            unique: true,
            sparse: true, // Only enforce uniqueness on non-null values
        },
        expiry_time: {
            type: Date,
            required: true,
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Indexes for better performance
chatMessageSchema.index({ sender_id: 1, recipient_id: 1 });
chatMessageSchema.index({ conversation_id: 1, createdAt: -1 });
broadcastRequestSchema.index({ student_id: 1, status: 1 });
broadcastRequestSchema.index({ status: 1, expiry_time: 1 });

export const ChatMessage = model<IChatMessage, ChatModel>('ChatMessage', chatMessageSchema);
export const BroadcastRequest = model<IBroadcastRequest, BroadcastRequestModel>('BroadcastRequest', broadcastRequestSchema);
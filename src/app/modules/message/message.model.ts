import { Schema, model } from 'mongoose';
import { IMessage, MessageModel } from './message.interface';
import { imageSchema } from '../../schema';

const messageSchema = new Schema<IMessage, MessageModel>(
    {
        senderId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        conversationId: {
            type: Schema.Types.ObjectId,
            ref: 'Conversation',
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        attachments: {
            type: [imageSchema],
            default: [],
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

export const Message = model<IMessage, MessageModel>('Message', messageSchema);
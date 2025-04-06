import { Schema, model } from 'mongoose';
import { IMessageRequest, MessageRequestModel } from './messageRequest.interface';
import { imageSchema } from '../../schema';

const messageRequestSchema = new Schema<IMessageRequest, MessageRequestModel>(
    {
        studentId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        initialMessage: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'closed'],
            default: 'pending',
        },
        attachments: {
            type: [imageSchema],
            default: [],
        },
        acceptedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
        },
    }
);

// Index for faster lookups by status
messageRequestSchema.index({ status: 1 });
// Index for faster lookups of a student's requests
messageRequestSchema.index({ studentId: 1, status: 1 });

export const MessageRequest = model<IMessageRequest, MessageRequestModel>(
    'MessageRequest',
    messageRequestSchema
);
import { Schema, model } from 'mongoose';
import { ConversationModel, IConversation, IParticipant } from './conversation.interface';

const participantSchema = new Schema<IParticipant>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        unreadCount: {
            type: Number,
            default: 0,
        },
        lastSeen: {
            type: Date,
            default: null,
        },
    },
    { _id: false }
);

const conversationSchema = new Schema<IConversation, ConversationModel>(
    {
        participants: {
            type: [participantSchema],
            required: true,
        },
        lastMessage: {
            type: Schema.Types.ObjectId,
            ref: 'Message',
            default: null,
        },
        lastMessageText: {
            type: String,
            default: '',
        },
        lastMessageTime: {
            type: Date,
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

// Create index on participants.userId for faster queries
conversationSchema.index({ 'participants.userId': 1 });

export const Conversation = model<IConversation, ConversationModel>(
    'Conversation',
    conversationSchema
);
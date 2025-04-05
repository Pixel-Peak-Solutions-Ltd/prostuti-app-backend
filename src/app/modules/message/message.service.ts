import { Types } from 'mongoose';
import { IMessage } from './message.interface';
import { Message } from './message.model';

import AppError from '../../classes/errorClasses/AppError';
import { StatusCodes } from 'http-status-codes';

import { IPaginationOptions, TImage } from '../../interfaces/common';
import { Conversation } from '../conversation/convesation.model';
import { calculatePagination } from '../../helpers/pagenationHelper';

const sendMessage = async (
    senderId: string,
    conversationId: string,
    content: string,
    attachments: TImage[] = []
): Promise<IMessage> => {
    // Check if the conversation exists
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Conversation not found');
    }

    // Check if the sender is a participant in the conversation
    const isParticipant = conversation.participants.some(
        (p) => p.userId.toString() === senderId
    );
    if (!isParticipant) {
        throw new AppError(StatusCodes.FORBIDDEN, 'You are not a participant in this conversation');
    }

    // Create the message
    const message = await Message.create({
        senderId: new Types.ObjectId(senderId),
        conversationId: new Types.ObjectId(conversationId),
        content,
        attachments,
    });

    // Update the conversation with the last message
    await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: message._id,
        lastMessageText: content,
        lastMessageTime: message.createdAt,
        $inc: {
            'participants.$[other].unreadCount': 1,
        },
    }, {
        arrayFilters: [{ 'other.userId': { $ne: new Types.ObjectId(senderId) } }],
    });

    return message;
};

const getMessages = async (
    userId: string,
    conversationId: string,
    paginationOptions: IPaginationOptions
) => {
    // Check if the conversation exists
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Conversation not found');
    }

    // Check if the user is a participant in the conversation
    const isParticipant = conversation.participants.some(
        (p) => p.userId.toString() === userId
    );
    if (!isParticipant) {
        throw new AppError(StatusCodes.FORBIDDEN, 'You are not a participant in this conversation');
    }

    // Calculate pagination
    const { page, limit, skip, sortBy, sortOrder } =
        calculatePagination(paginationOptions);

    // Get messages
    const messages = await Message.find({ conversationId })
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limit)
        .populate({
            path: 'senderId',
            select: 'name profileImage',
        });

    // Count total messages
    const total = await Message.countDocuments({ conversationId });

    return {
        meta: {
            page,
            limit,
            total,
        },
        data: messages,
    };
};

export const MessageService = {
    sendMessage,
    getMessages,
};
import { Types } from 'mongoose';

import { User } from '../user/user.model';
import AppError from '../../classes/errorClasses/AppError';
import { StatusCodes } from 'http-status-codes';
import { Conversation } from './convesation.model';
import { IPaginationOptions } from '../../interfaces/common';
import { calculatePagination } from '../../helpers/pagenationHelper';


const createConversation = async (userId: string, receiverId: string) => {
    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
        throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
    }

    // Check if conversation already exists between these two users
    const existingConversation = await Conversation.findOne({
        participants: {
            $all: [
                { $elemMatch: { userId: new Types.ObjectId(userId) } },
                { $elemMatch: { userId: new Types.ObjectId(receiverId) } },
            ],
        },
    });

    if (existingConversation) {
        return existingConversation;
    }

    // Create new conversation
    const conversation = await Conversation.create({
        participants: [
            { userId: new Types.ObjectId(userId), unreadCount: 0 },
            { userId: new Types.ObjectId(receiverId), unreadCount: 0 },
        ],
    });

    return conversation;
};

const getConversations = async (userId: string, paginationOptions: IPaginationOptions) => {
    // Calculate pagination
    const { page, limit, skip, sortBy, sortOrder } =
        calculatePagination(paginationOptions);

    // Get conversations where user is a participant
    const conversations = await Conversation.find({
        'participants.userId': new Types.ObjectId(userId),
    })
        .sort({ lastMessageTime: -1, updatedAt: -1 }) // Most recent conversations first
        .skip(skip)
        .limit(limit)
        .populate({
            path: 'participants.userId',
            select: 'name profileImage',
        })
        .populate({
            path: 'lastMessage',
            select: 'content createdAt',
        });

    // For each conversation, find the other participant (for display)
    const result = conversations.map((conversation) => {
        const otherParticipant = conversation.participants.find(
            (p) => p.userId._id.toString() !== userId
        );

        return {
            _id: conversation._id,
            otherUser: otherParticipant?.userId,
            unreadCount: conversation.participants.find(
                (p) => p.userId._id.toString() === userId
            )?.unreadCount || 0,
            lastMessage: conversation.lastMessage,
            lastMessageText: conversation.lastMessageText,
            lastMessageTime: conversation.lastMessageTime,
            updatedAt: conversation.updatedAt,
        };
    });

    // Count total conversations
    const total = await Conversation.countDocuments({
        'participants.userId': new Types.ObjectId(userId),
    });

    return {
        meta: {
            page,
            limit,
            total,
        },
        data: result,
    };
};

const getConversation = async (userId: string, conversationId: string) => {
    // Get the conversation
    const conversation = await Conversation.findById(conversationId)
        .populate({
            path: 'participants.userId',
            select: 'name profileImage',
        })
        .populate({
            path: 'lastMessage',
            select: 'content createdAt',
        });

    if (!conversation) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Conversation not found');
    }

    // Check if the user is a participant
    const isParticipant = conversation.participants.some(
        (p) => p.userId._id.toString() === userId
    );
    if (!isParticipant) {
        throw new AppError(StatusCodes.FORBIDDEN, 'You are not a participant in this conversation');
    }

    // Find the other participant (for display)
    const otherParticipant = conversation.participants.find(
        (p) => p.userId._id.toString() !== userId
    );

    return {
        _id: conversation._id,
        otherUser: otherParticipant?.userId,
        unreadCount: conversation.participants.find(
            (p) => p.userId._id.toString() === userId
        )?.unreadCount || 0,
        lastMessage: conversation.lastMessage,
        lastMessageText: conversation.lastMessageText,
        lastMessageTime: conversation.lastMessageTime,
        updatedAt: conversation.updatedAt,
    };
};

const markConversationAsRead = async (userId: string, conversationId: string) => {
    // Find the conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Conversation not found');
    }

    // Check if the user is a participant
    const participantIndex = conversation.participants.findIndex(
        (p) => p.userId.toString() === userId
    );
    if (participantIndex === -1) {
        throw new AppError(StatusCodes.FORBIDDEN, 'You are not a participant in this conversation');
    }

    // Update the unread count for the user
    await Conversation.findByIdAndUpdate(
        conversationId,
        {
            $set: {
                [`participants.${participantIndex}.unreadCount`]: 0,
                [`participants.${participantIndex}.lastSeen`]: new Date(),
            },
        },
        { new: true }
    );

    return { success: true };
};

export const ConversationService = {
    createConversation,
    getConversations,
    getConversation,
    markConversationAsRead,
};
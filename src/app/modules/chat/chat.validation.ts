import { z } from 'zod';
import { Types } from 'mongoose';

// Validation for creating a broadcast request
const createBroadcastRequestSchema = z.object({
    body: z.object({
        message: z
            .string({
                required_error: 'Message is required',
                invalid_type_error: 'Message must be a string',
            })
            .min(1, 'Message cannot be empty')
            .max(500, 'Message cannot exceed 500 characters'),
        subject: z
            .string({
                required_error: 'Subject is required',
                invalid_type_error: 'Subject must be a string',
            })
            .min(1, 'Subject cannot be empty')
            .max(100, 'Subject cannot exceed 100 characters'),
    }),
});

// Validation for accepting/declining a broadcast request
const broadcastActionSchema = z.object({
    params: z.object({
        broadcastId: z.string().refine((val) => Types.ObjectId.isValid(val), {
            message: 'Invalid broadcast ID format'
        })
    })
});

// Validation for sending a message
const sendMessageSchema = z.object({
    body: z.object({
        conversation_id: z
            .string({
                required_error: 'Conversation ID is required',
                invalid_type_error: 'Conversation ID must be a string',
            })
            .min(1, 'Conversation ID cannot be empty'),
        message: z
            .string({
                required_error: 'Message is required',
                invalid_type_error: 'Message must be a string',
            })
            .min(1, 'Message cannot be empty')
            .max(2000, 'Message cannot exceed 2000 characters'),
        recipient_id: z
            .string({
                required_error: 'Recipient ID is required',
                invalid_type_error: 'Recipient ID must be a string',
            })
            .refine((val) => Types.ObjectId.isValid(val), {
                message: 'Invalid recipient ID format',
            }),
    }),
});

// Validation for getting chat history
const getChatHistorySchema = z.object({
    query: z.object({
        conversation_id: z
            .string({
                required_error: 'Conversation ID is required',
                invalid_type_error: 'Conversation ID must be a string',
            })
            .min(1, 'Conversation ID cannot be empty')
            .optional(),
        sender_id: z
            .string()
            .refine((val) => Types.ObjectId.isValid(val), {
                message: 'Invalid sender ID format',
            })
            .optional(),
        recipient_id: z
            .string()
            .refine((val) => Types.ObjectId.isValid(val), {
                message: 'Invalid recipient ID format',
            })
            .optional(),
        page: z
            .string()
            .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
                message: 'Page must be a positive number',
            })
            .optional(),
        limit: z
            .string()
            .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
                message: 'Limit must be a positive number',
            })
            .optional(),
    }),
});

// Validation for marking messages as read
const markMessagesAsReadSchema = z.object({
    params: z.object({
        conversation_id: z
            .string({
                required_error: 'Conversation ID is required',
                invalid_type_error: 'Conversation ID must be a string',
            })
            .min(1, 'Conversation ID cannot be empty'),
    }),
});

export const chatValidator = {
    createBroadcastRequestSchema,
    broadcastActionSchema,
    sendMessageSchema,
    getChatHistorySchema,
    markMessagesAsReadSchema,
};
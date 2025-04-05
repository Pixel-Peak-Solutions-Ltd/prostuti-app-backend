import { isValidObjectId } from 'mongoose';
import { z } from 'zod';

export const createConversationZodSchema = z.object({
    body: z.object({
        receiverId: z
            .string()
            .refine((val) => isValidObjectId(val), {
                message: 'Invalid user ID format',
            }),
    }),
});

export const getConversationsZodSchema = z.object({
    query: z.object({
        limit: z.string().optional(),
        page: z.string().optional(),
    }).optional(),  // Make the entire query object optional
});

export const getConversationZodSchema = z.object({
    params: z.object({
        id: z
            .string()
            .refine((val) => isValidObjectId(val), {
                message: 'Invalid conversation ID format',
            }),
    }),
});

export const markConversationAsReadZodSchema = z.object({
    params: z.object({
        id: z
            .string()
            .refine((val) => isValidObjectId(val), {
                message: 'Invalid conversation ID format',
            }),
    }),
});
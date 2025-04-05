import { isValidObjectId } from 'mongoose';
import { z } from 'zod';


export const sendMessageZodSchema = z.object({
    body: z.object({
        conversationId: z
            .string()
            .refine((val) => isValidObjectId(val), {
                message: 'Invalid conversation ID format',
            }),
        content: z.string().min(1, 'Message content is required'),
    }),
});

export const getMessagesZodSchema = z.object({
    params: z.object({
        conversationId: z
            .string()
            .refine((val) => isValidObjectId(val), {
                message: 'Invalid conversation ID format',
            }),
    }),
    query: z.object({
        limit: z.string().optional(),
        page: z.string().optional(),
    }),
});
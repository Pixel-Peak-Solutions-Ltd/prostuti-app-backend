import { z } from 'zod';
import { isValidObjectId } from '../../helpers';


export const createMessageRequestZodSchema = z.object({
    body: z.object({
        content: z.string().min(1, 'Message content is required'),
    }),
});

export const messageRequestParamsZodSchema = z.object({
    params: z.object({
        messageRequestId: z
            .string()
            .refine((val) => isValidObjectId(val), {
                message: 'Invalid message request ID format',
            }),
    }),
});

export const getPendingMessageRequestsZodSchema = z.object({
    query: z.object({
        limit: z.string().optional(),
        page: z.string().optional(),
    }).optional(),
});
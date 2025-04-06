import { z } from 'zod';
import { isValidObjectId } from '../../helpers';


export const getNotificationsZodSchema = z.object({
    query: z.object({
        limit: z.string().optional(),
        page: z.string().optional(),
    }).optional(),
});

export const notificationIdParamZodSchema = z.object({
    params: z.object({
        notificationId: z
            .string()
            .refine((val) => isValidObjectId(val), {
                message: 'Invalid notification ID format',
            }),
    }),
});
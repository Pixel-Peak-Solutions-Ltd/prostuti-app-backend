import { z } from 'zod';

const createNotificationSchema = z.object({
    body: z.object({
        recipientId: z.string().min(1, 'Recipient ID is required'),
        type: z.enum(['EditRequest', 'CourseApproved', 'General'], {
            required_error: 'Type is required',
        }),
        title: z.string().min(1, 'Title is required'),
        message: z.string().min(1, 'Message is required'),
        resourceType: z.string().optional(),
        resourceId: z.string().optional(),
        metaData: z.record(z.any()).optional(),
    }),
});

export const notificationValidation = {
    createNotificationSchema,
};
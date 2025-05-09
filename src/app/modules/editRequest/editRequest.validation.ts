import { z } from 'zod';

const requestEditSchema = z.object({
    body: z.object({
        resourceType: z.enum(['Course', 'Assignment', 'RecodedClass', 'Resource', 'Test', 'Flashcard'], {
            required_error: 'Resource type is required',
        }),
        resourceId: z.string().min(1, 'Resource ID is required'),
        title: z.string().min(1, 'Title is required'),
        message: z.string().min(1, 'Message is required'),
    }),
});

export const editRequestValidation = {
    requestEditSchema,
};
import { Types } from 'mongoose';
import { z } from 'zod';

const createCourseReviewValidationSchema = z.object({
    body: z.object({
        course_id: z.string().refine((val) => Types.ObjectId.isValid(val), {
            message: 'Invalid MongoDB ObjectId',
        }),
        review: z
            .string({
                required_error: 'Review is required',
            })
            .min(5, 'Review must be at least 5 characters')
            .max(1000, 'Review must be at most 1000 characters'),
        rating: z
            .number({
                required_error: 'Rating is required',
            })
            .int('Rating must be an integer')
            .min(1, 'Rating must be at least 1')
            .max(5, 'Rating must be at most 5'),
        isArrived: z.boolean().optional(),
    }),
});

export const createCourseReviewValidator = {
    createCourseReviewValidationSchema,
};

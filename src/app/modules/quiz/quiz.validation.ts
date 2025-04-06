import { Types } from 'mongoose';
import { z } from 'zod';

const createQuiz = z.object({
    body: z.object({
        category_id: z
            .string({
                required_error: 'Category id is required',
            })
            .refine((val) => Types.ObjectId.isValid(val), {
                message: 'Invalid Category ID',
            }),
        questionCount: z
            .number({
                required_error: 'Question count is required',
            })
            .min(1, { message: 'Question count must be at least 1' }),
    }),
});
export const quizValidation = { createQuiz };

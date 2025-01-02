import { Types } from 'mongoose';
import { z } from 'zod';

const createTestHistorySchema = z.object({
    body: z.object({
        course_id: z
            .string()
            .length(24, 'Invalid course_id')
            .refine((val) => Types.ObjectId.isValid(val), {
                message: 'Invalid MongoDB ObjectId for course_id',
            }),
        lesson_id: z
            .string()
            .length(24, 'Invalid lesson_id')
            .refine((val) => Types.ObjectId.isValid(val), {
                message: 'Invalid MongoDB ObjectId for lesson_id',
            }),
        test_id: z
            .string()
            .length(24, 'Invalid test_id')
            .refine((val) => Types.ObjectId.isValid(val), {
                message: 'Invalid MongoDB ObjectId for test_id',
            }),
        answers: z
            .array(
                z.object({
                    question_id: z
                        .string()
                        .length(24, 'Invalid question_id')
                        .refine((val) => Types.ObjectId.isValid(val), {
                            message: 'Invalid MongoDB ObjectId for question_id',
                        }),
                    selectedOption: z.string().optional(),
                }),
            )
            .min(1, 'At least one answer is required'),
        timeTaken: z
            .number()
            .min(0, 'timeTaken must be a positive number')
            .int('timeTaken must be an integer'),
    }),
});
export const TestHistoryValidation = { createTestHistorySchema };

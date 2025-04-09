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

const createWrittenTestHistorySchema = z.object({
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
                    selectedOption: z.string().min(1,"Question answer is required"),
                }),
            )
            .min(1, 'At least one answer is required'),
        timeTaken: z
            .number()
            .min(0, 'timeTaken must be a positive number')
            .int('timeTaken must be an integer'),
    }),
});
const previewWrittenTestHistorySchema = z.object({
    body: z.object({
        test_history_id: z
        .string()
        .length(24, 'Invalid test_id')
        .refine((val) => Types.ObjectId.isValid(val), {
            message: 'Invalid MongoDB ObjectId for test_history_id',
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
                    selectedOption: z.string().min(1,"Question answer is required"),
                    mark:z.number().min(0,"mark can not be negative").max(1,"Mark can not be more than 1")
                }),
            )
            .min(1, 'At least one answer is required'),
    }),
});
export const TestHistoryValidation = { createTestHistorySchema,createWrittenTestHistorySchema,previewWrittenTestHistorySchema };

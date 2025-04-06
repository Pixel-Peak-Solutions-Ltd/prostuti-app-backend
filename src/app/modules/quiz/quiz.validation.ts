import { Types } from 'mongoose';
import { z } from 'zod';
import { QuestionTypes } from '../question/question.constant';

const createQuiz = z.object({
    body: z.object({
        category_id: z
            .string({
                required_error: 'Category id is required',
            })
            .refine((val) => Types.ObjectId.isValid(val), {
                message: 'Invalid Category ID',
            }),
        type: z.enum([...QuestionTypes] as [string, ...string[]], {
            required_error: 'Question type is required.',
        }),
        questionCount: z
            .number({
                required_error: 'Question count is required',
            })
            .min(1, { message: 'Question count must be at least 1' }),
    }),
});

const submitQuiz = z.object({
    body: z.object({
        quiz_id: z
            .string({
                required_error: 'Quiz id is required',
            })
            .refine((val) => Types.ObjectId.isValid(val), {
                message: 'Invalid Quiz ID',
            }),
        answers: z
            .array(
                z.object({
                    question_id: z
                        .string({
                            required_error: 'Question ID is required',
                        })
                        .refine((val) => Types.ObjectId.isValid(val), {
                            message: 'Invalid question ID',
                        }),
                    selectedOption: z
                        .string({
                            required_error: 'Selected option is required',
                        })
                        .min(1, 'Selected option cannot be empty'),
                }),
            )
            .min(1, 'At least one answer is required'),
    }),
});
export const quizValidation = { createQuiz, submitQuiz };

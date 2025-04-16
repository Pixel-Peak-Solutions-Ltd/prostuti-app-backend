import { Types } from 'mongoose';
import { z } from 'zod';
import { QuestionTypes } from '../question/question.constant';

const createMockQuiz = z.object({
    body: z.object({
        questionType: z.enum([...QuestionTypes] as [string, ...string[]], {
            required_error: 'Question type is required.',
        }),
        subjects: z
            .array(z.string().min(1, 'Subject cannot be an empty string'))
            .min(1, 'At least one subject is required'),
        questionCount: z
            .number({
                required_error: 'Question count is required',
            })
            .min(1, 'Question count must be at least 1'),
        isNegativeMarking: z.boolean({
            required_error: 'Is negative marking is required',
        }),
        time: z
            .number({
                required_error: 'Time is required',
            })
            .min(1, 'Time must be at least 1 minute'),
    }),
});

const submitMockQuiz = z.object({
    body: z.object({
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
const previewWrittenMockQuiz = z.object({
    body: z.object({
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
                    mark:z.number().min(0,"mark can not be negative").max(1,"Mark can not be more than 1"),
                }),
            )
            .min(1, 'At least one answer is required'),
    }),
});
export const quizValidation = { createMockQuiz, submitMockQuiz ,previewWrittenMockQuiz};

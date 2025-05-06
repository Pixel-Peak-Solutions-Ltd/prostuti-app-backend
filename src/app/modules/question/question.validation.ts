import { z } from 'zod';
import { QuestionTypes } from './question.constant';

const createQuestion = z.object({
    body: z
        .array(
            z
                .object({
                    type: z.enum([...QuestionTypes] as [string, ...string[]], {
                        required_error: 'Question type is required.',
                    }),
                    category_id: z.string().min(1, 'Category id is required'),
                    title: z.string().min(1, 'Question title is required'),
                    description: z
                        .string()
                        .min(1, 'Question description is required'),
                    options: z
                        .array(z.string())
                        .length(4, 'There must be exactly 4 options')
                        .optional(),
                    correctOption: z
                        .string()
                        .min(1, 'Correct ans can not be a empty string')
                        .optional(),
                })
                .strict()
                .refine(
                    (data) => {
                        if (data.type === 'MCQ') {
                            return (
                                data.options &&
                                data.correctOption &&
                                data.options.includes(data.correctOption)
                            );
                        }
                        return true;
                    },
                    {
                        message:
                            'MCQ questions require a question, 4 options, and a correct option that must be one of the options.',
                        path: ['options', 'correctOption'],
                    },
                ),
        )
        .min(1, 'Question can not be empty'),
});
const updateQuestion = z.object({
    body: z
    .object({
        title: z.string().min(1, 'Question title is required').optional(),
        description: z
            .string()
            .min(1, 'Question description is required')
            .optional(),
        options: z
            .array(z.string())
            .length(4, 'There must be exactly 4 options')
            .optional(),
        correctOption: z
            .string()
            .min(1, 'Correct answer cannot be empty')
            .optional(),
    })
    .strict()
    .refine(
        (data) => {
            if (data.options && data.correctOption) {
                return data.options.includes(data.correctOption);
            }
            return true;
        },
        {
            message:
                'The correct option must be one of the provided options.',
            path: ['options', 'correctOption'],
        },
    ),
});

const approveQuestionSchema = z.object({
    body: z.object({
        // Empty object as we don't need additional data for approval
    }).strict(),
});

const rejectQuestionSchema = z.object({
    body: z.object({
        rejectionReason: z.string().min(1, 'Rejection reason is required'),
    }).strict(),
});

export const QuestionValidation = { createQuestion,updateQuestion, approveQuestionSchema,
    rejectQuestionSchema, };

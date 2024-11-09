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

export const QuestionValidation = { createQuestion };

import { Types } from 'mongoose';
import { z } from 'zod';
import { QuestionTypes } from '../question/question.constant';
import { quizzerFilter } from './quiz.constant';

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

const createQuizzerQuiz = z.object({
    body: z.object({
        questionType: z.enum([...QuestionTypes] as [string, ...string[]], {
            required_error: 'Question type is required.',
        }),
        subjects: z
            .array(z.string().min(1, 'Subject cannot be an empty string'))
            .min(1, 'At least one subject is required'),
        questionFilters: z
            .array(
                z.enum([...quizzerFilter] as [string, ...string[]], {
                    required_error: 'Quizzer filter is required.',
                }),
            )
            .min(1, 'At least one filter is required'),
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
const submitQuizzerQuiz = z.object({
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

const createSegmentQuiz = z.object({
    body: z.object({
        questionType: z.enum([...QuestionTypes] as [string, ...string[]], {
            required_error: 'Question type is required.',
        }),
        mainSubjects: z
            .array(
                z.object({
                    subject: z.string().min(1, 'Subject is required'),
                    questionCount: z
                        .number()
                        .int()
                        .min(1, 'Question count must be a positive integer'),
                }),
            )
            .min(1, 'At least one subject is required'),
        optionalSubjects: z
            .array(
                z.object({
                    subject: z.string().min(1, 'Subject is required'),
                    questionCount: z
                        .number()
                        .int()
                        .min(1, 'Question count must be a positive integer'),
                }),
            )
            .optional(),
        category_id: z
            .array(
                z.string().refine((val) => Types.ObjectId.isValid(val), {
                    message: 'Invalid category ID',
                }),
            )
            .min(1, 'At least one category ID is required'),
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

const submitSegmentQuiz = z.object({
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

export const quizValidation = {
    createMockQuiz,
    submitMockQuiz,
    createQuizzerQuiz,
    submitQuizzerQuiz,
    createSegmentQuiz,
    submitSegmentQuiz
};

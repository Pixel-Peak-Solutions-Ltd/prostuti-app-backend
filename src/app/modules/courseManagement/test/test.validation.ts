import { Types, isValidObjectId } from 'mongoose';
import { z } from 'zod';
import { QuestionTypes } from '../../question/question.constant';
import { TestTypes } from './test.constant';

const questionListItemSchema = z
    .object({
        questionId: z
            .string()
            .refine((id) => isValidObjectId(id), {
                message: 'Invalid question ID',
            })
            .optional(),

        newQuestion: z
            .object({
                type: z.enum([...QuestionTypes] as [string, ...string[]], {
                    required_error: 'Question type is required.',
                }),
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
                    .min(1, 'Correct answer cannot be an empty string')
                    .optional(),
            })
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
                        'MCQ questions require exactly 4 options, and the correct option must be one of them.',
                    path: ['options', 'correctOption'],
                },
            )
            .optional(),
    })
    .refine(
        (data) => {
            return data.questionId || data.newQuestion;
        },
        {
            message: 'Either questionId or newQuestion must be provided.',
            path: ['questionId', 'newQuestion'],
        },
    );

const createTestSchema = z.object({
    body: z.object({
        course_id: z
            .string()
            .min(1, 'Course id is required')
            .refine((val) => Types.ObjectId.isValid(val), {
                message: 'Invalid MongoDB ObjectId',
            }),

        lesson_id: z
            .string()
            .min(1, 'Lesson id is required')
            .refine((val) => Types.ObjectId.isValid(val), {
                message: 'Invalid MongoDB ObjectId',
            }),

        name: z.string().min(1, 'Test name is required'),
        type: z.enum([...TestTypes] as [string, ...string[]], {
            required_error: 'Test type is required.',
        }),
        time: z.number().int().positive('Time must be a positive integer'),
        publishDate: z
            .string()
            .datetime({ message: 'Invalid date format' })
            .min(1, 'Publish date is required'),
        questionList: z
            .array(questionListItemSchema)
            .min(1, 'At least one question is required'),
    }),
});

const updateTestSchema = z.object({
    body: z.object({
      name: z.string().min(1, 'Test name is required').optional(),
      time: z
        .number()
        .int()
        .positive('Time must be a positive integer')
        .optional(),
      publishDate: z
        .string()
        .datetime({ message: 'Invalid date format' })
        .optional(),
      questionList: z
        .array(questionListItemSchema)
        .optional(),
      removeQuestions: z
        .array(z.string().refine((id) => Types.ObjectId.isValid(id), {
          message: 'Invalid question ID',
        }))
        .optional(),
    }),
  });
export const TestValidation = { createTestSchema ,updateTestSchema};

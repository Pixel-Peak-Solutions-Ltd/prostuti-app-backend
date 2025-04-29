import { Types } from 'mongoose';
import { z } from 'zod';
import { QuestionTypes } from '../question/question.constant';

const SubjectSchema = z.object({
    subject: z.string().min(1, 'Subject is required'),
    questionType:  z.enum([...QuestionTypes] as [string, ...string[]], {
        required_error: 'Question type is required.',
    }),
    questionCount: z.number().int().min(1, 'Question count must be a positive integer'),
  });

const createQuestionPatternSchema = z.object({
    body: z.object({
        category_id: z
            .array(
                z.string().refine((val) => Types.ObjectId.isValid(val), {
                    message: 'Invalid category ID',
                }),
            )
            .min(1, 'At least one category ID is required'),
            time: z.number().positive('Time must be a positive number')
            .min(1, 'Time must be at least 1 minute'),
            mainSubjects: z.array(SubjectSchema).min(1, 'At least one main subject is required'),
            optionalSubjects: z.array(SubjectSchema).optional(),

    }),
});

const updateQuestionPatternSchema = z.object({
    body: z.object({
      category_id: z
        .array(
          z.string().refine((val) => Types.ObjectId.isValid(val), {
            message: 'Invalid category ID',
          }),
        )
        .min(1, 'At least one category ID is required')
        .optional(),
      time: z.number().positive('Time must be a positive number').min(1, 'Time must be at least 1 minute').optional(),
      mainSubjects: z.array(SubjectSchema).min(1, 'At least one main subject is required').optional(),
      optionalSubjects: z.array(SubjectSchema).optional(),
    })
})

export const questionPatternValidation = {
    createQuestionPatternSchema,
    updateQuestionPatternSchema,
};

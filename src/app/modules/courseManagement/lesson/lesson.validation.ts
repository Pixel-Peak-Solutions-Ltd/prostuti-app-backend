import { z } from 'zod';
import { Types } from 'mongoose';

const createLessonValidationSchema = z.object({
    body: z.object({
        lessons: z
            .array(
                z.object({
                    number: z
                        .string()
                        .regex(
                            /^Lesson \d+$/,
                            'Lesson number must be in the format "Lesson 1", "Lesson 2", etc.',
                        ),
                    name: z.string().min(3).max(100),
                }),
            )
            .min(1, 'Lesson array should contain at least 1 element'),
        course_id: z.string().refine((val) => Types.ObjectId.isValid(val), {
            message: 'Invalid MongoDB ObjectId',
        }),
    }),
});

const updateLessonValidationSchema = z.object({
    body: z.object({
        number: z
            .string()
            .regex(
                /^Lesson \d+$/,
                'Lesson number must be in the format "Lesson 1", "Lesson 2", etc.',
            )
            .optional(),
        name: z.string().min(3).max(100).optional(),
        course_id: z
            .string()
            .transform((val) => new Types.ObjectId(val))
            .optional(),
    }),
});

export const lessonValidator = {
    createLessonValidationSchema,
    updateLessonValidationSchema,
};

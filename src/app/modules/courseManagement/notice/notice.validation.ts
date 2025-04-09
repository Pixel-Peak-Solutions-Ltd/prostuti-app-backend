import { z } from 'zod';
import { Types } from 'mongoose';

const createNoticeValidationSchema = z.object({
    body: z.object({
        course_id: z.string().refine((value) => Types.ObjectId.isValid(value), {
            message: 'Course ID must be a valid MongoDB ObjectId',
        }),
        notices: z.array(
            z.object({
                // noticeId: z.string(),
                notice: z
                    .string()
                    .min(2, {
                        message: 'Notice must be at least 2 characters long',
                    })
                    .max(500, {
                        message: 'Notice cannot be longer than 500 characters',
                    }),
            }),
        ),
    }),
});

const updateNoticeValidationSchema = z.object({
    body: z.object({
        notice: z
            .string()
            .min(2, { message: 'Notice must be at least 2 characters long' })
            .max(500, {
                message: 'Notice cannot be longer than 500 characters',
            })
            .optional(),
    }),
});

export const noticeValidator = {
    createNoticeValidationSchema,
    updateNoticeValidationSchema,
};

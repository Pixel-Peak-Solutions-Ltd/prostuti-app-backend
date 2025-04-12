import { Types } from 'mongoose';
import { z } from 'zod';

const createFreeEnrolledCourse = z.object({
    body: z
        .object({
            course_id: z
                .array(
                    z
                        .string()
                        .length(24, 'Each Course ID must be a valid ObjectId'),
                )
                .min(1, 'At least one course id is required'),
        })
        .strict(),
});
const createSubscriptionEnrolledCourse = z.object({
    body: z
        .object({
            course_id: z
                .array(
                    z
                        .string()
                        .length(24, 'Each Course ID must be a valid ObjectId'),
                )
                .min(1, 'At least one course id is required'),
        })
        .strict(),
});
const createPaidEnrolledCourse = z.object({
    body: z
        .object({
            course_id: z
                .array(
                    z
                        .string()
                        .length(24, 'Each Course ID must be a valid ObjectId'),
                )
                .min(1, 'At least one course id is required'),
            voucher_id: z
                .string()
                .length(24, 'Invalid test_id')
                .refine((val) => Types.ObjectId.isValid(val), {
                    message: 'Invalid MongoDB ObjectId for test_id',
                })
                .optional(),
        })
        .strict(),
});

export const EnrolledCourseValidation = {
    createFreeEnrolledCourse,
    createPaidEnrolledCourse,
    createSubscriptionEnrolledCourse,
};

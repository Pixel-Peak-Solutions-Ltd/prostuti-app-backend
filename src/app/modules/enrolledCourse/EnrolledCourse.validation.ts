import { z } from 'zod';

const createFreeEnrolledCourse = z.object({
    body: z.object({
        course_id: z
            .array(
                z
                    .string()
                    .length(24, 'Each Course ID must be a valid ObjectId'),
            )
            .min(1, 'At least one course id is required'),
    }).strict()
})
const createSubscriptionEnrolledCourse = z.object({
    body: z.object({
        course_id: z
            .array(
                z
                    .string()
                    .length(24, 'Each Course ID must be a valid ObjectId'),
            )
            .min(1, 'At least one course id is required'),
    }).strict()
})
const createPaidEnrolledCourse = z.object({
    body: z.object({

        totalPrice: z.number().positive('Total price must be a positive number'),
        course_id: z
            .array(
                z
                    .string()
                    .length(24, 'Each Course ID must be a valid ObjectId'),
            )
            .min(1, 'At least one course id is required'),
    }).strict()
})

export const EnrolledCourseValidation = { createFreeEnrolledCourse,createPaidEnrolledCourse,createSubscriptionEnrolledCourse};

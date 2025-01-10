import { Types } from 'mongoose';
import { z } from 'zod';
import { ASSIGNMENT_SUBMISSION_STATUS } from './assignmentSubmission.constant';

const assignmentSubmissionValidationSchema = z.object({
    body: z.object({
        course_id: z.string().refine((val) => Types.ObjectId.isValid(val), {
            message: 'Invalid MongoDB ObjectId',
        }),

        assignment_id: z.string().refine((val) => Types.ObjectId.isValid(val), {
            message: 'Invalid MongoDB ObjectId',
        }),

        status: z.enum(
            Object.values(ASSIGNMENT_SUBMISSION_STATUS) as [
                string,
                ...string[],
            ],
            {
                required_error: 'Status is required',
                invalid_type_error: 'Invalid status value',
            },
        ),

        submissionDate: z
            .string({
                required_error: 'Submission date is required',
                invalid_type_error:
                    'Submission date must be a valid date string',
            })
            .datetime({
                message:
                    'Invalid date format. Please provide a valid ISO date string',
            })
            .refine((date) => new Date(date) <= new Date(), {
                message: 'Submission date cannot be in the future',
            }),
    }),
});

const updateAssignmentSubmissionValidationSchema = z.object({
    body: z.object({
        givenMark: z
            .string({
                required_error: 'givenMark is required',
                invalid_type_error: 'givenMark must be in string',
            })
            .regex(/^\d+$/, 'givenMark must contain only numbers')
            .refine((val) => {
                const num = parseInt(val);
                return num >= 0;
            }, 'givenMark cannot be negative'),
    }),
});

export const assignmentSubmissionValidator = {
    assignmentSubmissionValidationSchema,
    updateAssignmentSubmissionValidationSchema,
};

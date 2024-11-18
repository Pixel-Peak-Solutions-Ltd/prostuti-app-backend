import { z } from 'zod';
import { RoutineTypes } from './routine.constant';
import { Types } from 'mongoose';

const createRoutineSchema = z.object({
    body: z.object({
        course_id: z
            .string()
            .min(1, 'Course id is required')
            .refine((value) => Types.ObjectId.isValid(value), {
                message: 'Course ID must be a valid MongoDB ObjectId',
            }),
        type: z.enum([...RoutineTypes] as [string, ...string[]], {
            required_error: 'Routine type is required.',
        }),
        date: z
            .string()
            .datetime({ message: 'Invalid date format' })
            .min(1, 'Date is required'),
    }),
});
export const RoutineValidation = { createRoutineSchema };

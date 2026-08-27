import { z } from 'zod';
import { ASSIGNED_WORKS } from '../teacher/teacher.constant';

const createTeacherAdminValidationSchema = z.object({
    body: z.object({
        email: z
            .string({
                required_error: 'Email is required',
                invalid_type_error: 'Email must be a string',
            })
            .email('Invalid email format'),

        password: z
            .string({
                required_error: 'Password is required',
                invalid_type_error: 'Password must be a string',
            })
            .min(6, 'Password must be at least 6 characters long')
            .max(20, 'Password must not exceed 20 characters'),
    }),
});

const createTeacherValidationSchema = z.object({
    body: z.object({
        name: z
            .string({
                invalid_type_error: 'name must be string',
            })
            .trim()
            .min(1, 'Teacher name must be at least 1 characters')
            .max(20, 'Teacher name cannot be more than 20 characters')
            .optional(),

        email: z
            .string({
                required_error: 'Email is required',
                invalid_type_error: 'Email must be a string',
            })
            .email('Invalid email format'),

        password: z
            .string({
                required_error: 'Password is required',
                invalid_type_error: 'Password must be a string',
            })
            .min(6, 'Password must be at least 6 characters long')
            .max(20, 'Password must not exceed 20 characters'),
        subjects: z
            .array(z.string())
            .min(1, 'At least one subject is required')
            .optional(),

        assignedWorks: z
            .array(z.string())
            .refine(
                (works) => {
                    const allowedWorks = Object.values(
                        ASSIGNED_WORKS,
                    ) as string[];
                    return works.every((work) => allowedWorks.includes(work));
                },
                {
                    message: `Each assigned work must be one of: ${Object.values(ASSIGNED_WORKS).join(', ')}`,
                },
            )
            .optional(),
    }),
});

export const userValidator = {
    createTeacherAdminValidationSchema,
    createTeacherValidationSchema,
};

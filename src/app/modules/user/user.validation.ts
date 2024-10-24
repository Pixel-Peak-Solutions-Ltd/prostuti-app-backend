import { z } from 'zod';

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
            .min(8, 'Password must be at least 8 characters long')
            .max(20, 'Password must not exceed 20 characters')
            .regex(
                /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])(?=.*[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/,
                'Password must contain at least one uppercase letter, one number, and one special character',
            ),
    }),
});

export const userValidator = {
    createTeacherAdminValidationSchema,
};

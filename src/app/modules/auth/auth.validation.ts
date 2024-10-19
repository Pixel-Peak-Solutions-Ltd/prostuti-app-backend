import { z } from 'zod';

const registerStudentValidationSchema = z.object({
    body: z
        .object({
            name: z
                .string()
                .trim()
                .min(2, 'Student name must be at least 2 characters')
                .max(20, 'Student name cannot be more than 20 characters'),
            email: z
                .string({
                    required_error: 'Email is required',
                    invalid_type_error: 'Email must be a string',
                })
                .email('Invalid email format')
                .optional(),
            phone: z
                .string({
                    required_error: 'Phone number is required',
                    invalid_type_error: 'Phone number must be a string',
                })
                .regex(
                    /^(\+?880|0)1[3456789]\d{8}$/,
                    'Invalid Bangladeshi phone number',
                )
                .min(11, 'Phone number must be at least 11 characters')
                .max(14, 'Phone number must not exceed 14 characters'),

            password: z
                .string({
                    required_error: 'Password is required',
                    invalid_type_error: 'Password must be a string',
                })
                .min(8, 'Password must be at least 8 characters long')
                .max(20, 'Password must not exceed 20 characters'),
            confirmPassword: z.string({
                required_error: 'Confirm password is required',
                invalid_type_error: 'Confirm password must be a string',
            }),
        })
        .refine((data) => data.password === data.confirmPassword, {
            message: "Passwords don't match",
            path: ['confirmPassword'],
        }),
});

const loginUserSchema = z.object({
    body: z.object({
        phone: z
            .string({
                required_error: 'Phone number is required',
                invalid_type_error: 'Phone number must be a string',
            })
            .regex(
                /^(\+?880|0)1[3456789]\d{8}$/,
                'Invalid Bangladeshi phone number',
            )
            .min(11, 'Phone number must be at least 11 characters')
            .max(14, 'Phone number must not exceed 14 characters')
            .optional(),

        email: z
            .string({
                required_error: 'Email is required',
                invalid_type_error: 'Email must be a string',
            })
            .email('Invalid email format')
            .optional(),

        password: z.string({
            required_error: 'Password is required',
            invalid_type_error: 'Password must be a string',
        }),
    }),
});

const studentRefreshTokenValidationSchema = z.object({
    body: z.object({
        refreshToken: z.string({
            required_error: 'Refresh token is required!',
        }),
    }),
});

const teacherAdminRefreshTokenValidationSchema = z.object({
    cookies: z.object({
        refreshToken: z.string({
            required_error: 'Refresh token is required!',
        }),
    }),
});

export const authValidator = {
    registerStudentValidationSchema,
    loginUserSchema,
    studentRefreshTokenValidationSchema,
    teacherAdminRefreshTokenValidationSchema,
};

import { z } from 'zod';

const registerStudentValidationSchema = z.object({
    body: z
        .object({
            otpCode: z
                .string({
                    required_error: 'otpCode is required',
                    invalid_type_error: 'otpCode must be string',
                })
                .regex(/^[0-9]{4}$/, 'Invalid OTP code'),
            name: z
                .string({
                    required_error: 'name is required',
                    invalid_type_error: 'name must be string',
                })
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
                .max(20, 'Password must not exceed 20 characters')
                .regex(
                    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])(?=.*[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/,
                    'Password must contain at least one uppercase letter, one number, and one special character',
                ),
            confirmPassword: z
                .string({
                    required_error: 'Confirm password is required',
                    invalid_type_error: 'Confirm password must be a string',
                })
                .regex(
                    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])(?=.*[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/,
                    'Password must contain at least one uppercase letter, one number, and one special character',
                ),
        })
        .refine((data) => data.password === data.confirmPassword, {
            message: "Passwords don't match",
            path: ['confirmPassword'],
        }),
});

const loginUserSchema = z.object({
    body: z.object({
        rememberMe: z
            .string()
            .regex(/^[1-9]\d*d$/, "Must be a non-zero number followed by 'd'")
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
            required_error: 'refreshToken is required',
            invalid_type_error: 'refreshToken must be a string',
        }),
    }),
});

const teacherAdminRefreshTokenValidationSchema = z.object({
    cookies: z.object({
        refreshToken: z.string({
            required_error: 'refreshToken is required',
            invalid_type_error: 'refreshToken must be a string',
        }),
    }),
});

const studentResetPasswordValidationSchema = z.object({
    body: z
        .object({
            otpCode: z
                .string({
                    required_error: 'otpCode is required',
                    invalid_type_error: 'otpCode must be string',
                })
                .regex(/^[0-9]{4}$/, 'Invalid OTP code'),
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

            newPassword: z
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
            confirmNewPassword: z
                .string({
                    required_error: 'Confirm password is required',
                    invalid_type_error: 'Confirm password must be a string',
                })
                .regex(
                    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])(?=.*[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/,
                    'Password must contain at least one uppercase letter, one number, and one special character',
                ),
        })
        .refine((data) => data.newPassword === data.confirmNewPassword, {
            message: "Passwords don't match",
            path: ['confirmPassword'],
        }),
});

export const authValidator = {
    registerStudentValidationSchema,
    loginUserSchema,
    studentRefreshTokenValidationSchema,
    teacherAdminRefreshTokenValidationSchema,
    studentResetPasswordValidationSchema,
};

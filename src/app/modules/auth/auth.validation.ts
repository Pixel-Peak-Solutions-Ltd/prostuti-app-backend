import { z } from 'zod';
import { categoryType } from '../category/category.constant';
import { getValidSubCategories, MainCategory } from './category/category.constant';

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
            // Add categoryType validation back
            categoryType: z.enum([...categoryType] as [string, ...string[]], {
                required_error: 'Category type is required',
                invalid_type_error: `Invalid category type. Allowed values are: ${categoryType.join(', ')}`,
            }),
            // Add subCategory
            subCategory: z.string().optional(),
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
        })
        .superRefine((data, ctx) => {
            // For Job category, subCategory should not be provided
            if (data.categoryType === MainCategory.JOB && data.subCategory) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Job category should not have a subcategory',
                    path: ['subCategory'],
                });
                return;
            }

            // For Academic and Admission, subCategory is required
            if ((data.categoryType === MainCategory.ACADEMIC || data.categoryType === MainCategory.ADMISSION)
                && !data.subCategory) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Subcategory is required for ${data.categoryType}`,
                    path: ['subCategory'],
                });
                return;
            }

            // If subCategory is provided, it should be valid for the mainCategory
            if (data.subCategory) {
                const validSubcategories = getValidSubCategories(data.categoryType);
                if (!validSubcategories.includes(data.subCategory)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: `Invalid subcategory. Valid subcategories for ${data.categoryType} are: ${validSubcategories.join(', ')}`,
                        path: ['subCategory'],
                    });
                    return;
                }
            }
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

const changePasswordValidationSchema = z.object({
    body: z
        .object({
            oldPassword: z.string({
                required_error: 'oldPassword is required',
                invalid_type_error: 'oldPassword must be a string',
            }),
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
            confirmPassword: z
                .string({
                    required_error: 'confirmPassword is required',
                    invalid_type_error: 'confirmPassword must be a string',
                })
                .min(8, 'confirmPassword must be at least 8 characters long')
                .max(20, 'confirmPassword must not exceed 20 characters')
                .regex(
                    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])(?=.*[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/,
                    'confirmPassword must contain at least one uppercase letter, one number, and one special character',
                ),
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
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
    changePasswordValidationSchema,
};

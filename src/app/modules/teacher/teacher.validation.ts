import { z } from 'zod';
import { categoryType } from '../category/category.constant';

const updateTeacherValidationSchema = z.object({
    body: z.object({
        name: z
            .string({
                required_error: 'name is required',
                invalid_type_error: 'name must be string',
            })
            .trim()
            .min(2, 'Teacher name must be at least 2 characters')
            .max(20, 'Teacher name cannot be more than 20 characters')
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

        subject: z
            .string({
                required_error: 'Subject is required',
                invalid_type_error: 'Subject must be a string',
            })
            .trim()
            .min(1, 'Subject must be at least 1 characters')
            .max(20, 'Subject cannot be more than 20 characters')
            .optional(),

        jobType: z
            .enum([...(categoryType as [string, ...string[]])], {
                required_error: 'jobType is required',
                invalid_type_error: `Invalid jobType. Allowed values are: ${Object.values(categoryType).join(', ')}`,
            })
            .optional(),
    }),
});

export const teacherValidator = {
    updateTeacherValidationSchema,
};

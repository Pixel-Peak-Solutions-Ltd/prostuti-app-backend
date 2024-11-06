import { z } from 'zod';
import { categoryType } from '../../category/category.constant';

const createCourseValidationSchema = z.object({
    body: z.object({
        name: z
            .string({
                required_error: 'Course name is required',
            })
            .trim()
            .min(3, 'Course name must be at least 3 characters long')
            .max(255, 'Course name cannot exceed 255 characters')
            .refine(
                (value) => /^[a-zA-Z0-9\s-]+$/.test(value),
                'Course name can only contain letters, numbers, spaces, and hyphens',
            ),
        category: z.enum([...(categoryType as [string, ...string[]])], {
            required_error: 'Category type is required',
            invalid_type_error: `Invalid categoryType. Allowed values are: ${Object.values(categoryType).join(', ')}`,
        }),
        details: z
            .string({
                required_error: 'Course details are required',
            })
            .trim()
            .min(5, 'Course details must be at least 5 characters long')
            .max(5000, 'Course details cannot exceed 5000 characters'),
    }),
});

const updateCourseValidationSchema = z.object({
    body: z.object({
        name: z
            .string({
                required_error: 'Course name is required',
            })
            .trim()
            .min(3, 'Course name must be at least 3 characters long')
            .max(255, 'Course name cannot exceed 255 characters')
            .refine(
                (value) => /^[a-zA-Z0-9\s-]+$/.test(value),
                'Course name can only contain letters, numbers, spaces, and hyphens',
            )
            .optional(),
        category: z
            .enum([...(categoryType as [string, ...string[]])], {
                required_error: 'Category type is required',
                invalid_type_error: `Invalid categoryType. Allowed values are: ${Object.values(categoryType).join(', ')}`,
            })
            .optional(),
        details: z
            .string({
                required_error: 'Course details are required',
            })
            .trim()
            .min(5, 'Course details must be at least 5 characters long')
            .max(5000, 'Course details cannot exceed 5000 characters')
            .optional(),
    }),
});

export const courseValidator = {
    createCourseValidationSchema,
    updateCourseValidationSchema,
};

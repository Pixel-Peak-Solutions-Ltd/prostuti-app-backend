import { z } from 'zod';
import { categoryType } from '../../category/category.constant';
import { priceType } from './course.constant';
import { Types } from 'mongoose';

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
        category_id: z
            .string({
                required_error: 'category_id is required',
                invalid_type_error: 'category_id must be a string',
            })
            .refine((value: string) => Types.ObjectId.isValid(value), {
                message: 'Invalid MongoDB ObjectId',
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

const approveCourseValidationSchema = z.object({
    body: z.object({
        priceType: z.enum([...(priceType as [string, ...string[]])], {
            required_error: 'Price type is required',
            invalid_type_error: `Invalid categoryType. Allowed values are: ${Object.values(priceType).join(', ')}`,
        }),
        price: z
            .number({
                required_error: 'Price is required',
                invalid_type_error: 'Price must be in number',
            })
            .positive()
            .min(0, 'Price must be minimum zero'),
        voucher: z.object({
            title: z
                .string()
                .min(1, 'Title is required')
                .regex(/^\S+$/, 'Title should not contain spaces'),
            discountType: z.enum(['Amount', 'Percentage'] as [string, ...string[]], {
                required_error: 'Discount type is required.',
            }),
            discountValue: z
                .number({ required_error: 'Discount value is required' })
                .min(0, { message: 'Discount value must be 0 or greater' }),
            startDate: z
                .string()
                .datetime({ message: 'Invalid date format' })
                .min(1, 'Start date is required'),
            endDate: z
                .string()
                .datetime({ message: 'Invalid date format' })
                .min(1, 'End date is required'),
        }).optional(),
    }),
});

export const courseValidator = {
    createCourseValidationSchema,
    updateCourseValidationSchema,
    approveCourseValidationSchema,
};

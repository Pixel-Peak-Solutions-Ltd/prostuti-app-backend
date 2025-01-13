import { Types } from 'mongoose';
import { z } from 'zod';

const createRecodedClassValidationSchema = z.object({
    body: z.object({
        course_id: z.string().refine((val) => Types.ObjectId.isValid(val), {
            message: 'Invalid MongoDB ObjectId',
        }),
        lesson_id: z.string().refine((val) => Types.ObjectId.isValid(val), {
            message: 'Invalid MongoDB ObjectId',
        }),
        recodeClassName: z
            .string({
                required_error: 'Recode class name is required',
                invalid_type_error: 'Recode class name must be a string',
            })
            .min(2, 'Recode class name must be at least 2 characters long')
            .max(100, 'Recode class name cannot exceed 100 characters')
            .trim(),

        classDate: z
            .string({
                required_error: 'Class date is required',
                invalid_type_error: 'Class date must be a valid date string',
            })
            .datetime({
                message:
                    'Invalid date format. Please provide a valid ISO date string',
            })
            .refine((date) => new Date(date) >= new Date(), {
                message: 'Class date cannot be in the past',
            }),

        classDetails: z
            .string({
                required_error: 'Class details are required',
                invalid_type_error: 'Class details must be a string',
            })
            .min(10, 'Class details must be at least 10 characters long')
            .max(5000, 'Class details cannot exceed 5000 characters')
            .trim(),
    }),
});

const updateRecodedClassValidationSchema = z.object({
    body: z.object({
        recodeClassName: z
            .string({
                required_error: 'Recode class name is required',
                invalid_type_error: 'Recode class name must be a string',
            })
            .min(2, 'Recode class name must be at least 2 characters long')
            .max(100, 'Recode class name cannot exceed 100 characters')
            .trim()
            .optional(),

        classDate: z
            .string({
                required_error: 'Class date is required',
                invalid_type_error: 'Class date must be a valid date string',
            })
            .datetime({
                message:
                    'Invalid date format. Please provide a valid ISO date string',
            })
            .optional(),

        classDetails: z
            .string({
                required_error: 'Class details are required',
                invalid_type_error: 'Class details must be a string',
            })
            .min(10, 'Class details must be at least 10 characters long')
            .max(5000, 'Class details cannot exceed 5000 characters')
            .trim()
            .optional(),
    }),
});

// Export the schema
export const recodedClassValidation = {
    createRecodedClassValidationSchema,
    updateRecodedClassValidationSchema,
};

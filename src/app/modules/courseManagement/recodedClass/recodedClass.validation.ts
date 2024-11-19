import { z } from 'zod';
import { validDomains } from './recodedClass.constant';
import { Types } from 'mongoose';

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

        classVideoURL: z
            .array(
                z
                    .string({
                        required_error: 'Video URL is required',
                        invalid_type_error: 'Video URL must be a string',
                    })
                    .url('Invalid video URL format')
                    .refine(
                        (url) => {
                            return validDomains.some((domain) =>
                                url.includes(domain),
                            );
                        },
                        {
                            message:
                                'Only YouTube, Vimeo, or Google Drive URLs are allowed',
                        },
                    ),
            )
            .min(1, 'At least one video URL is required')
            .max(10, 'Cannot exceed 10 video URLs per class')
            .refine(
                (urls) => {
                    // Check for duplicate URLs
                    const uniqueUrls = new Set(urls);
                    return uniqueUrls.size === urls.length;
                },
                {
                    message: 'Duplicate video URLs are not allowed',
                },
            ),
    }),
});

const updateRecodedClassValidationSchema = z.object({
    body: z.object({
        course_id: z
            .string()
            .refine((val) => Types.ObjectId.isValid(val), {
                message: 'Invalid MongoDB ObjectId',
            })
            .optional(),
        lesson_id: z
            .string()
            .refine((val) => Types.ObjectId.isValid(val), {
                message: 'Invalid MongoDB ObjectId',
            })
            .optional(),

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
            .refine((date) => new Date(date) >= new Date(), {
                message: 'Class date cannot be in the past',
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

        classVideoURL: z
            .array(
                z
                    .string({
                        required_error: 'Video URL is required',
                        invalid_type_error: 'Video URL must be a string',
                    })
                    .url('Invalid video URL format')
                    .refine(
                        (url) => {
                            return validDomains.some((domain) =>
                                url.includes(domain),
                            );
                        },
                        {
                            message:
                                'Only YouTube, Vimeo, or Google Drive URLs are allowed',
                        },
                    ),
            )
            .min(1, 'At least one video URL is required')
            .max(10, 'Cannot exceed 10 video URLs per class')
            .refine(
                (urls) => {
                    // Check for duplicate URLs
                    const uniqueUrls = new Set(urls);
                    return uniqueUrls.size === urls.length;
                },
                {
                    message: 'Duplicate video URLs are not allowed',
                },
            )
            .optional(),
    }),
});

// Export the schema
export const recodedClassValidation = {
    createRecodedClassValidationSchema,
    updateRecodedClassValidationSchema,
};

import { z } from 'zod';

const createResourceValidationSchema = z.object({
    body: z.object({
        name: z
            .string({
                required_error: 'Resource name is required',
                invalid_type_error: 'Resource name must be a string',
            })
            .min(2, 'Resource name must be at least 2 characters long')
            .max(100, 'Resource name cannot exceed 100 characters')
            .trim(),

        resourceDate: z
            .string({
                required_error: 'resourceDate is required',
                invalid_type_error: 'resourceDate must be a valid date string',
            })
            .datetime({
                message:
                    'Invalid date format. Please provide a valid ISO date string',
            })
            .refine((date) => new Date(date) >= new Date(), {
                message: 'resourceDate cannot be in the past',
            }),
    }),
});

const updateResourceValidationSchema = z.object({
    body: z.object({
        name: z
            .string({
                required_error: 'Resource name is required',
                invalid_type_error: 'Resource name must be a string',
            })
            .min(2, 'Resource name must be at least 2 characters long')
            .max(100, 'Resource name cannot exceed 100 characters')
            .trim()
            .optional(),

        resourceDate: z
            .string({
                required_error: 'resourceDate is required',
                invalid_type_error: 'resourceDate must be a valid date string',
            })
            .datetime({
                message:
                    'Invalid date format. Please provide a valid ISO date string',
            })
            .refine((date) => new Date(date) >= new Date(), {
                message: 'resourceDate cannot be in the past',
            })
            .optional(),
    }),
});

export const resourceValidator = {
    createResourceValidationSchema,
    updateResourceValidationSchema,
};

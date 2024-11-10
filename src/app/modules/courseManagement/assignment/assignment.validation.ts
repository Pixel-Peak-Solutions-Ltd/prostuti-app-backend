import { z } from 'zod';

const createAssignmentValidationSchema = z.object({
    body: z
        .object({
            assignmentNo: z.string().min(1, 'Assignment number is required'),
            marks: z
                .number({
                    required_error: 'Marks are required',
                    invalid_type_error: 'Marks must be a number',
                })
                .int('Marks must be a whole number')
                .min(0, 'Marks cannot be negative'),
            unlockDate: z
                .string({
                    required_error: 'Unlock date is required',
                    invalid_type_error:
                        'Unlock date must be a valid date string',
                })
                .datetime({
                    message:
                        'Invalid date format. Please provide a valid ISO date string',
                }),
            deadline: z
                .string({
                    required_error: 'Deadline is required',
                    invalid_type_error: 'Deadline must be a valid date string',
                })
                .datetime({
                    message:
                        'Invalid date format. Please provide a valid ISO date string',
                }),
            details: z
                .string()
                .min(1, 'Details are required')
                .min(1, 'Details cannot be empty'),
        })
        .superRefine((data, ctx) => {
            const unlockDate = new Date(data.unlockDate);
            const deadline = new Date(data.deadline);

            if (deadline <= unlockDate) {
                ctx.addIssue({
                    path: ['deadline'],
                    code: z.ZodIssueCode.custom,
                    message: 'Deadline must be after unlock date',
                });
            }
        }),
});

const updateAssignmentValidationSchema = z.object({
    body: z
        .object({
            assignmentNo: z
                .string()
                .min(1, 'Assignment number is required')
                .optional(),
            marks: z
                .number({
                    required_error: 'Marks are required',
                    invalid_type_error: 'Marks must be a number',
                })
                .int('Marks must be a whole number')
                .min(0, 'Marks cannot be negative')
                .optional(),
            unlockDate: z
                .string({
                    required_error: 'Unlock date is required',
                    invalid_type_error:
                        'Unlock date must be a valid date string',
                })
                .datetime({
                    message:
                        'Invalid date format. Please provide a valid ISO date string',
                })
                .optional(),
            deadline: z
                .string({
                    required_error: 'Deadline is required',
                    invalid_type_error: 'Deadline must be a valid date string',
                })
                .datetime({
                    message:
                        'Invalid date format. Please provide a valid ISO date string',
                })
                .optional(),
            details: z
                .string()
                .min(1, 'Details are required')
                .min(1, 'Details cannot be empty')
                .optional(),
        })
        .superRefine((data, ctx) => {
            if (data.unlockDate && data.deadline) {
                const unlockDate = new Date(data.unlockDate);
                const deadline = new Date(data.deadline);

                if (deadline <= unlockDate) {
                    ctx.addIssue({
                        path: ['deadline'],
                        code: z.ZodIssueCode.custom,
                        message: 'Deadline must be after unlock date',
                    });
                }
            }
        }),
});

export const assignmentValidator = {
    createAssignmentValidationSchema,
    updateAssignmentValidationSchema,
};

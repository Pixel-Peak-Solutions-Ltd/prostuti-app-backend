import { z } from 'zod';
import { Gender } from './student.constant';

const createStudentValidationSchema = z.object({
    body: z.object({
        name: z
            .string()
            .refine(
                (data) =>
                    data.trim().length > 0 &&
                    data.length <= 20 &&
                    /^[A-Z][a-z]*$/.test(data),
                {
                    message:
                        'First name must be capitalized, can not contain any number or spacial character and have maximum 20 characters',
                },
            ),
        gender: z.enum([...(Gender as [string, ...string[]])]),
        dateOfBirth: z.string(),
        email: z.string().email(),
        contactNo: z.string(),
    }),
});

const updateStudentValidationSchema = z.object({
    body: z.object({
        name: z
            .string()
            .refine(
                (data) =>
                    data.trim().length > 0 &&
                    data.length <= 20 &&
                    /^[A-Z][a-z]*$/.test(data),
                {
                    message:
                        'First name must be capitalized, can not contain any number or spacial character and have maximum 20 characters',
                },
            )
            .optional(),
        gender: z.enum([...(Gender as [string, ...string[]])]).optional(),
        dateOfBirth: z.string().optional(),
        email: z.string().email().optional(),
        contactNo: z.string().optional(),
    }),
});

export const studentValidator = {
    createStudentValidationSchema,
    updateStudentValidationSchema,
};

import { z } from 'zod';
import { categoryType } from '../category/category.constant';

const updateStudentValidationSchema = z.object({
    body: z.object({
        name: z
            .string({
                required_error: 'name is required',
                invalid_type_error: 'name must be string',
            })
            .trim()
            .min(2, 'Name must be at least 2 characters')
            .max(20, 'Name cannot be more than 20 characters')
            .optional(),

        categoryType: z
            .enum([...(categoryType as [string, ...string[]])], {
                required_error: 'Category type is required',
                invalid_type_error: `Invalid categoryType. Allowed values are: ${Object.values(categoryType).join(', ')}`,
            })
            .optional(),
    }),
});

export const studentValidator = {
    updateStudentValidationSchema,
};

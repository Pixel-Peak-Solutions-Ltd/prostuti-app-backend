import { z } from 'zod';
import {
    mainCategories,
    getValidSubCategories,
    MainCategory
} from '../auth/category/category.constant';

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
    }),
});

// New validation schema for updating student category
const updateStudentCategoryValidationSchema = z.object({
    body: z.object({
        mainCategory: z.enum([...mainCategories] as [string, ...string[]], {
            required_error: 'Main category is required',
            invalid_type_error: `Invalid main category. Allowed values are: ${mainCategories.join(', ')}`,
        }),
        subCategory: z.string().optional(),
    })
        .superRefine((data, ctx) => {
            // For Job category, subCategory should not be provided
            if (data.mainCategory === MainCategory.JOB && data.subCategory) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Job category should not have a subcategory',
                    path: ['subCategory'],
                });
                return;
            }

            // For Academic and Admission, subCategory is required
            if ((data.mainCategory === MainCategory.ACADEMIC || data.mainCategory === MainCategory.ADMISSION)
                && !data.subCategory) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Subcategory is required for ${data.mainCategory}`,
                    path: ['subCategory'],
                });
                return;
            }

            // If subCategory is provided, it should be valid for the mainCategory
            if (data.subCategory) {
                const validSubcategories = getValidSubCategories(data.mainCategory);
                if (!validSubcategories.includes(data.subCategory)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: `Invalid subcategory. Valid subcategories for ${data.mainCategory} are: ${validSubcategories.join(', ')}`,
                        path: ['subCategory'],
                    });
                    return;
                }
            }
        }),
});

export const studentValidator = {
    updateStudentValidationSchema,
    updateStudentCategoryValidationSchema,
};
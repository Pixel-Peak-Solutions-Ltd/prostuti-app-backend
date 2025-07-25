import { z } from 'zod';
import {
    categoryDivision,
    categoryType,
    categoryUniversityType,
} from './category.constant';

const createCategory = z.object({
    body: z
        .object({
            type: z.enum([...categoryType] as [string, ...string[]], {
                required_error: 'Category type is required.',
            }),
            division: z
                .enum([...categoryDivision] as [string, ...string[]])
                .optional(),
            subject: z
                .string({
                    required_error: 'Subject is required',
                })
                .min(1, 'Subject cannot be an empty string'),
            chapter: z
                .string()
                .min(1, 'Chapter cannot be an empty string')
                .optional(),
            lesson: z
                .string()
                .min(1, 'Lesson cannot be an empty string')
                .optional(),
            universityType: z
                .enum([...categoryUniversityType] as [string, ...string[]])
                .optional(),
            universityName: z
                .string()
                .min(1, 'University name cannot be an empty string')
                .optional(),
            unit: z
                .string()   
                .min(1, 'Unit cannot be an empty string')
                .optional(),
            jobType: z
                .string()
                .min(1, 'Job type cannot be an empty string')
                .optional(),
            jobName: z
                .string()
                .min(1, 'Job name cannot be an empty string')
                .optional()
        })
        .strict()
        .refine(
            (data) => {
                if (data.type === 'Academic') {
                    return data.division && data.subject 
                }
                return true;
            },
            {
                message: 'Division and Subject are required for Academic type.',
                path: ['division', 'subject'],
            },
        )
        .refine(
            (data) => {
                if (data.type === 'Admission') {
                    return (
                        data.universityType &&
                        data.universityName &&
                        data.subject
                    );
                }
                return true;
            },
            {
                message:
                    'University Type, University Name, and Subject are required for Admission type.',
                path: ['universityType', 'universityName', 'subject'],
            },
        )
        .refine(
            (data) => {
                if (data.type === 'Job') {
                    return (
                        data.jobType &&
                        data.jobName &&
                        data.subject
                    )
                }
                return true;
            },
            {
                message: 'Job Type, Job Name, and Subject are required for Job type.',
                path: ['jobType', 'jobName', 'subject'],
            },
        ),
});

const updateCategory = z.object({
    body: z
        .object({
            type: z
                .enum([...categoryType] as [string, ...string[]], {
                    required_error: 'Category type is required.',
                })
                .optional(),
            division: z
                .enum([...categoryDivision] as [string, ...string[]])
                .optional(),
            subject: z
                .string({
                    required_error: 'Subject is required',
                })
                .min(1, 'Subject cannot be an empty string')
                .optional(),
            chapter: z
                .string()
                .min(1, 'Chapter cannot be an empty string')
                .optional(),
            lesson:z    
                    .string()
                    .min(1, 'Lesson cannot be an empty string')
                    .optional(),
            universityType: z
                .enum([...categoryUniversityType] as [string, ...string[]])
                .optional(),
            universityName: z
                .string()
                .min(1, 'University name cannot be an empty string')
                .optional(),
            unit: z
                .string()
                .min(1, 'Unit cannot be an empty string')
                .optional(),
            jobType: z
                .string()
                .min(1, 'Job type cannot be an empty string')
                .optional(),
            jobName: z
                .string()
                .min(1, 'Job name cannot be an empty string')
                .optional(),      
        })
        .strict(),
});

export const CategoryValidation = {
    createCategory,
    updateCategory,
};

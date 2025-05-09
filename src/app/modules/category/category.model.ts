import { Schema, model } from 'mongoose';
import {
    categoryDivision,
    categoryType,
    categoryUniversityType,
} from './category.constant';
import { CategoryModel, ICategory } from './category.interface';

const CategorySchema = new Schema<ICategory, CategoryModel>(
    {
        type: {
            type: String,
            enum: categoryType,
            required: [true, 'Type is required.'],
        },
        division: {
            type: String,
            enum: categoryDivision,
        },
        subject: {
            type: String,
            // unique: true,
            required: [true, 'Subject is required.'],
        },
        chapter: {
            type: String,
            default: 'All',
        },
        lesson: {
            type: String,
            default: 'All',
        },
        universityType: {
            type: String,
            enum: categoryUniversityType,
        },
        universityName: {
            type: String,
        },
        unit: {
            type: String,
        },
        jobType: {
            type: String,   
        },
        jobName: {
            type: String,
        },


    },
    {
        timestamps: true,
    },
);

// Custom validation for conditional requirements based on `type`
CategorySchema.pre('validate', function (next) {
    const data = this as ICategory;

    // Academic type validation
    if (data.type === 'Academic') {
        if (!data.division) {
            this.invalidate('division', 'Division is required for Academic type.');
        }
        if (!data.subject) {
            this.invalidate('subject', 'Subject is required for Academic type.');
        }
    }

    // Admission type validation
    if (data.type === 'Admission') {
        if (!data.universityType) {
            this.invalidate('universityType', 'University Type is required for Admission type.');
        }
        if (!data.universityName) {
            this.invalidate('universityName', 'University Name is required for Admission type.');
        }
        if (!data.subject) {
            this.invalidate('subject', 'Subject is required for Admission type.');
        }
    }

    // Job type validation
    if (data.type === 'Job') {
        if (!data.jobType) {
            this.invalidate('jobType', 'Job Type is required for Job type.');
        }
        if (!data.jobName) {
            this.invalidate('jobName', 'Job Name is required for Job type.');
        }
        if (!data.subject) {
            this.invalidate('subject', 'Subject is required for Job type.');
        }
    }

    next();
});

// Create unique compound indexes based on the `type`
CategorySchema.index(
    { type: 1, division: 1, subject: 1, chapter: 1, lesson: 1 },
    { unique: true, partialFilterExpression: { type: 'Academic' } },
);
CategorySchema.index(
    { type: 1, universityType: 1, universityName: 1,unit:1, subject: 1 },
    { unique: true, partialFilterExpression: { type: 'Admission' } },
);
CategorySchema.index(
    { type: 1,jobType:1,jobName:1, subject: 1 },
    { unique: true, partialFilterExpression: { type: 'Job' } },
);

export const Category = model<ICategory, CategoryModel>(
    'Category',
    CategorySchema,
);

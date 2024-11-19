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
        },
        universityType: {
            type: String,
            enum: categoryUniversityType,
        },
        universityName: {
            type: String,
        },
    },
    {
        timestamps: true,
    },
);

// Create unique compound indexes based on the `type`
CategorySchema.index(
    { type: 1, division: 1, subject: 1, chapter: 1 },
    { unique: true, partialFilterExpression: { type: 'Academic' } },
);
CategorySchema.index(
    { type: 1, universityType: 1, universityName: 1, subject: 1 },
    { unique: true, partialFilterExpression: { type: 'Admission' } },
);
CategorySchema.index(
    { type: 1, subject: 1 },
    { unique: true, partialFilterExpression: { type: 'Job' } },
);

export const Category = model<ICategory, CategoryModel>(
    'Category',
    CategorySchema,
);

import { Schema, model } from 'mongoose';
import { categoryDivision, categoryType, categoryUniversityType } from './category.constant';
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
        unit: {
            type: String,
        },
    },
    {
        timestamps: true,
    },
);

export const Category = model<ICategory, CategoryModel>(
    'Category',
    CategorySchema,
);

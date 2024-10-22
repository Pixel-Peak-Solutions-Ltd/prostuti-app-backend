import { Schema, model } from 'mongoose';
import {
    categoryClass,
    categoryDivision,
    categoryType,
} from './category.constant';
import { CategoryModel, ICategory } from './category.interface';

const CategorySchema = new Schema<ICategory, CategoryModel>(
    {
        type: {
            type: String,
            enum: categoryType,
            required: [true, 'Type is required.'],
        },
        class: {
            type: String,
            enum: categoryClass,
        },
        division: {
            type: String,
            enum: categoryDivision,
        },
        subject: {
            type: String,
            unique: true,
            required: [true, 'Subject is required.'],
        },
        universityType: {
            type: String,
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

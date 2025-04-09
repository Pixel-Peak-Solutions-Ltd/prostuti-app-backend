import { Schema, model } from 'mongoose';
import { IRecodedClass, TVideo } from './recodedClass.interface';

const videoSchema = new Schema<TVideo>(
    {
        diskType: {
            type: String,
            required: [true, 'Image disk type is required'],
        },
        path: {
            type: String,
            required: [true, 'Image url is required'],
        },
        originalName: {
            type: String,
            required: [true, 'Image original name is required'],
        },
        modifiedName: {
            type: String,
            required: [true, 'Image modified name is required'],
        },
        fileId: {
            type: String,
            required: [true, 'File ID is required'],
        },
    },
    { _id: false, versionKey: false },
);

// Recoded Class Schema
const recodedClassSchema = new Schema<IRecodedClass>(
    {
        course_id: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Course',
        },
        lesson_id: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Lesson',
        },
        recodeClassName: {
            type: String,
            required: [true, 'Recode class name is required'],
            trim: true,
            maxlength: [
                100,
                'Recode class name cannot be more than 100 characters',
            ],
            minlength: [
                2,
                'Recode class name must be at least 2 characters long',
            ],
            index: true, // Adding index for faster queries
        },
        classDate: {
            type: Date,
            required: [true, 'Class date is required'],
            validate: {
                validator: function (value: Date) {
                    return value instanceof Date && !isNaN(value.getTime());
                },
                message: 'Invalid date format',
            },
            index: true, // Adding index for date-based queries
        },
        classDetails: {
            type: String,
            required: [true, 'Class details are required'],
            trim: true,
            minlength: [
                10,
                'Class details must be at least 10 characters long',
            ],
            maxlength: [
                5000,
                'Class details cannot be more than 5000 characters',
            ],
        },
        classVideoURL: {
            type: videoSchema,
        },
        isCompleted: {
            type: Boolean,
            default: false,

        }
    },
    {
        timestamps: true,
        versionKey: false,
        toObject: { virtuals: true },
    },

);

recodedClassSchema.index(
    { course_id: 1, lesson_id: 1, recodeClassName: 1 },
    { unique: true },
);

// Compound index for optimized queries
recodedClassSchema.index({ recodeClassName: 1, classDate: 1 });

// Create and export the model
export const RecodedClass = model<IRecodedClass>(
    'RecodedClass',
    recodedClassSchema,
);

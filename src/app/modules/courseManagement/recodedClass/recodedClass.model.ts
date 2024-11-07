import { Schema, model } from 'mongoose';
import { IRecodedClass } from './recodedClass.interface';
import { validDomains } from './recodedClass.constant';

// Custom URL validator function
const validateVideoURL = (urls: string[]): boolean => {
    const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/;

    return urls.every((url) => {
        if (!urlPattern.test(url)) return false;
        return validDomains.some((domain) => url.includes(domain));
    });
};

// Recoded Class Schema
const recodedClassSchema = new Schema<IRecodedClass>(
    {
        lessonName: {
            type: String,
            required: [true, 'Lesson name is required'],
            trim: true,
            maxlength: [100, 'Lesson name cannot be more than 100 characters'],
            minlength: [2, 'Lesson name must be at least 2 characters long'],
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
            type: [String],
            required: [true, 'At least one video URL is required'],
            validate: [
                {
                    validator: function (urls: string[]) {
                        return urls.length > 0;
                    },
                    message: 'At least one video URL is required',
                },
                {
                    validator: validateVideoURL,
                    message:
                        'Invalid video URL format. Only YouTube, Vimeo, or Google Drive URLs are allowed',
                },
            ],
        },
    },
    {
        timestamps: true,
        versionKey: false,
        toObject: { virtuals: true },
    },
);

// Compound index for optimized queries
recodedClassSchema.index({ recodeClassName: 1, classDate: 1 });

// Virtual for video count
recodedClassSchema.virtual('videoCount').get(function () {
    return this.classVideoURL.length;
});

// Create and export the model
export const RecodedClass = model<IRecodedClass>(
    'RecodedClass',
    recodedClassSchema,
);

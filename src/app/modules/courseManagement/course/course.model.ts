import { Schema, model } from 'mongoose';
import { ICourse, TImage } from './course.interface';
import { categoryType } from '../../category/category.constant';

// Image Schema
const imageSchema = new Schema<TImage>(
    {
        diskType: {
            type: String,
            required: [true, 'Image disk type is required'],
            trim: true,
        },
        path: {
            type: String,
            required: [true, 'Image URL is required'],
            trim: true,
            validate: {
                validator: function (v: string) {
                    // Basic URL validation
                    return /^(http:\/\/|https:\/\/|\/)/i.test(v);
                },
                message: 'Invalid image path format',
            },
        },
        originalName: {
            type: String,
            required: [true, 'Image original name is required'],
            trim: true,
            maxlength: [
                255,
                'Original name cannot be more than 255 characters',
            ],
        },
        modifiedName: {
            type: String,
            required: [true, 'Image modified name is required'],
            trim: true,
            maxlength: [
                255,
                'Modified name cannot be more than 255 characters',
            ],
        },
        fileId: {
            type: String,
            required: [true, 'File ID is required'],
            trim: true,
        },
    },
    { _id: false, versionKey: false },
);

// Course Schema
const courseSchema = new Schema<ICourse>(
    {
        teacher_id: {
            type: Schema.Types.ObjectId,
            ref: 'Teacher',
            required: [true, 'Teacher ID is required'],
        },
        name: {
            type: String,
            required: [true, 'Course name is required'],
            trim: true,
            minlength: [3, 'Course name must be at least 3 characters long'],
            maxlength: [255, 'Course name cannot be more than 255 characters'],
        },
        category: {
            type: String,
            required: [true, 'Course category is required'],
            enum: {
                values: [...categoryType],
                message: '{VALUE} is not a valid category',
            },
        },
        image: {
            type: imageSchema,
            required: [true, 'Course image is required'],
        },
        details: {
            type: String,
            required: [true, 'Course details are required'],
            trim: true,
            minlength: [5, 'Course details must be at least 5 characters long'],
            maxlength: [5000, 'Course details cannot exceed 5000 characters'],
        },
        isPending: {
            type: Boolean,
            default: true,
        },
        isPublished: {
            type: Boolean,
            default: false,
        },
        approvedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

// Indexes for better query performance
courseSchema.index({ name: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ 'image.fileId': 1 });

// Middleware for data cleanup before saving
courseSchema.pre('save', function (next) {
    // Convert course name to proper case
    if (this.isModified('name')) {
        this.name =
            this.name.charAt(0).toUpperCase() +
            this.name.slice(1).toLowerCase();
    }
    next();
});

// Create and export the model
export const Course = model<ICourse>('Course', courseSchema);

import { Schema, model } from 'mongoose';
import { ICourseReview } from './courseReview.interface';

const courseReviewSchema = new Schema<ICourseReview>(
    {
        course_id: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Course',
        },
        student_id: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Student',
        },
        review: {
            type: String,
            required: true,
            trim: true,
            minlength: 5,
            maxlength: 1000,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
            validate: {
                validator: Number.isInteger,
                message: 'Rating must be an integer between 1 and 5',
            },
        },
        isArrived: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

export const CourseReview = model<ICourseReview>(
    'CourseReview',
    courseReviewSchema,
);

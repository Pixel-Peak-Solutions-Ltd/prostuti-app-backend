import { Schema, model } from 'mongoose';
import {
    EnrolledCourseModel,
    IEnrolledCourse,
} from './enrolledCourse.interface';
import { EnrolledCourseTypes } from './enrolledCourse.constant';

const EnrolledCourseSchema = new Schema<IEnrolledCourse, EnrolledCourseModel>(
    {
        student_id: {
            type: Schema.Types.ObjectId,
            ref: 'Student',
            required: true,
        },
        course_id: {
            type: Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
        },
        enrollmentType: {
            type: String,
            enum: EnrolledCourseTypes,
            required: true,
        },
        payment_id: { type: Schema.Types.ObjectId, ref: 'Payment' },
        enrolledAt: { type: Date, default: Date.now },
        enrolledExpireAt: {
            type: Date,
            validate: {
                validator: function (value) {
                    // If enrollmentType is Subscription, enrolledExpireAt must be set
                    if (this.enrollmentType === 'Subscription') {
                        return !!value; // Must not be null or undefined
                    }
                    return true; // For other types, no validation
                },
                message:
                    'enrolledExpireAt is required for Subscription enrollmentType.',
            },
        },
    },
    {
        timestamps: true,
    },
);

export const EnrolledCourse = model<IEnrolledCourse, EnrolledCourseModel>(
    'EnrolledCourse',
    EnrolledCourseSchema,
);

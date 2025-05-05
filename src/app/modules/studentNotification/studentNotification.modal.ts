import { Schema, model } from 'mongoose';
import { IStudentNotification } from './studentNotification.interface';

const StudentNotificationSchema = new Schema<IStudentNotification>(
    {
        student_id: {
            type: Schema.Types.ObjectId,
            ref: 'Student',
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

export const StudentNotification = model<IStudentNotification>(
    'StudentNotification',
    StudentNotificationSchema,
);

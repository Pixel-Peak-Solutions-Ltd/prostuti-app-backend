import { Schema, model } from 'mongoose';
import { ITeacherResponse, TeacherResponseModel } from './teacherResponse.interface';

const teacherResponseSchema = new Schema<ITeacherResponse, TeacherResponseModel>(
    {
        messageRequestId: {
            type: Schema.Types.ObjectId,
            ref: 'MessageRequest',
            required: true,
        },
        teacherId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'declined'],
            default: 'pending',
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
        },
    }
);

// Create compound index to ensure uniqueness of messageRequestId and teacherId combination
teacherResponseSchema.index({ messageRequestId: 1, teacherId: 1 }, { unique: true });

// Index for faster lookup of pending requests for a teacher
teacherResponseSchema.index({ teacherId: 1, status: 1 });

export const TeacherResponse = model<ITeacherResponse, TeacherResponseModel>(
    'TeacherResponse',
    teacherResponseSchema
);
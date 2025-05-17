import { Schema, model } from 'mongoose';
import { ITeacherLog, TeacherLogModel } from './teacherLog.interface';

const TeacherLogSchema = new Schema<ITeacherLog, TeacherLogModel>(
    {
        teacher_id: {
            type: Schema.Types.ObjectId,
            ref: 'Teacher',
            required: true,
        },
        action: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        ip: {
            type: String,
            trim: true,
        },
        userAgent: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    },
);

export const TeacherLog = model<ITeacherLog, TeacherLogModel>(
    'TeacherLog',
    TeacherLogSchema,
);

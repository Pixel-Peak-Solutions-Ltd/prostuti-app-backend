import mongoose, { model, Schema } from "mongoose";
import { IStudentProgress } from "./progress.interface";

const studentClassProgressSchema = new Schema<IStudentProgress>(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        materialType: {
            type: String,
            enum: ['record', 'assignment', 'resource', 'test'],
            required: true,
        },
        material_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        course_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true
        },
        isCompleted: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

export const StudentProgress = model<IStudentProgress>('StudentProgress', studentClassProgressSchema);
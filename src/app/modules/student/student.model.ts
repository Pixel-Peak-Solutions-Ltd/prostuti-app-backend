import { Schema, model } from 'mongoose';
import { IStudent } from './student.interface';

// Student Schema
const studentSchema = new Schema<IStudent>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            required: [true, 'userId is required'],
            ref: 'User',
        },
        studentId: {
            type: String,
            required: [true, 'studentId is required'],
            unique: true,
        },
        studentName: {
            type: String,
        },
        studentPhone: {
            type: String,
            unique: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

// Create a Model
export const Student = model<IStudent>('Student', studentSchema);

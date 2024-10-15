import { Schema, model } from 'mongoose';
import { ITeacher } from './teacher.interface';

const teacherSchema = new Schema<ITeacher>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            required: [true, 'userId is required'],
            ref: 'User',
        },
        teacherId: {
            type: String,
            required: [true, 'teacherId is required'],
            unique: true,
        },
        teacherName: {
            type: String,
            trim: true,
            minlength: [2, 'teacherName must be at least 2 characters long'],
            maxlength: [
                100,
                'teacherName cannot be more than 100 characters long',
            ],
        },
        teacherPhone: {
            type: String,
            trim: true,
            validate: {
                validator: function (v: string) {
                    return /^(\+?880|0)1[3456789]\d{8}$/.test(v);
                },
                message: (props) =>
                    `${props.value} is not a valid phone number!`,
            },
        },
        teacherEmail: {
            type: String,
            required: [true, 'teacherEmail is required'],
            trim: true,
            lowercase: true,
            validate: {
                validator: function (v: string) {
                    return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(
                        v,
                    );
                },
                message: (props) =>
                    `${props.value} is not a valid email address!`,
            },
        },
        teacherProfileImageURL: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

// Create and export the model
export const Teacher = model<ITeacher>('Teacher', teacherSchema);

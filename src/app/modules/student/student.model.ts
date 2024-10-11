import { Schema, model } from 'mongoose';
import { IStudent } from './student.interface';
import { Gender } from './student.constant';
import validator from 'validator';

const studentSchema = new Schema<IStudent>(
    {
        name: {
            type: String,
            required: [true, 'ID is required'],
            unique: true,
        },
        gender: {
            type: String,
            enum: {
                values: Gender,
                message: '{VALUE} is not valid',
            },
            required: [true, 'Gender is required'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            validate: {
                validator: function (value: string) {
                    return validator.isEmail(value);
                },
                message: '{VALUE} is not valid email',
            },
        },
        contactNo: {
            type: String,
            required: [true, 'Contact number is required'],
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
        },
    },
);

// Create a Model
export const Student = model<IStudent>('Student', studentSchema);

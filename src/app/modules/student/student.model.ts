import { Schema, model } from 'mongoose';
import { IStudent } from './student.interface';
import { formatPhoneNumber } from '../../utils/formatPhoneNumber';

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
            trim: true,
            maxlength: [20, 'Student name cannot be more than 20 characters'],
        },
        studentPhone: {
            type: String,
            validate: [
                {
                    validator: function (phone: string) {
                        return /^(\+?880|0)1[3456789]\d{8}$/.test(phone);
                    },
                    message: 'Invalid Bangladeshi phone number',
                },
            ],
        },
        studentEmail: {
            type: String,
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
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

// Pre-save middleware to format the phone number
studentSchema.pre('save', function (next) {
    if (this.studentPhone && this.isModified('studentPhone')) {
        this.studentPhone = formatPhoneNumber(this.studentPhone);
    }
    next();
});

// Create a Model
export const Student = model<IStudent>('Student', studentSchema);

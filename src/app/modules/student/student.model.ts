import { Schema, model } from 'mongoose';
import { IStudent } from './student.interface';
import { formatPhoneNumber } from '../../utils/formatPhoneNumber';
import { categoryType } from '../category/category.constant';

// Student Schema
const studentSchema = new Schema<IStudent>(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            required: [true, 'user_id is required'],
            ref: 'User',
        },
        studentId: {
            type: String,
            required: [true, 'studentId is required'],
            unique: true,
        },
        name: {
            type: String,
            trim: true,
            maxlength: [20, 'Student name cannot be more than 20 characters'],
        },
        categoryType: {
            type: String,
            enum: {
                values: categoryType,
                message:
                    '{VALUE} is not a valid category type. Category type must be either Academic, Admission, or Job',
            },
            required: [true, 'Category type is required'],
        },
        phone: {
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
        email: {
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
    if (this.phone && this.isModified('phone')) {
        this.phone = formatPhoneNumber(this.phone);
    }
    next();
});

// Create a Model
export const Student = model<IStudent>('Student', studentSchema);

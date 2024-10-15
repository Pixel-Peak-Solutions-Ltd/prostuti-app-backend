import { Schema, model } from 'mongoose';
import { IAdmin } from './admin.interface';

const adminSchema = new Schema<IAdmin>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            required: [true, 'userId is required'],
            ref: 'User',
        },
        adminId: {
            type: String,
            required: [true, 'teacherId is required'],
            unique: true,
        },
        adminName: {
            type: String,
            trim: true,
            minlength: [2, 'teacherName must be at least 2 characters long'],
            maxlength: [
                100,
                'teacherName cannot be more than 100 characters long',
            ],
        },
        adminPhone: {
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
        adminEmail: {
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
        adminProfileImageURL: {
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
export const Admin = model<IAdmin>('Admin', adminSchema);

import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import { IUserModel, IUser } from './user.interface';
import { USER_ROLE, USER_STATUS } from './user.constant';
import config from '../../config';
import { formatPhoneNumber } from '../../utils/formatPhoneNumber';

// User Schema
const userSchema = new Schema<IUser, IUserModel>(
    {
        id: {
            type: String,
            required: [true, 'ID is required'],
            unique: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            select: 0,
            minlength: [8, 'Password must be at least 8 characters long'],
            maxlength: [20, 'Password must not exceed 20 characters'],
        },
        phone: {
            type: String,
            unique: true,
            sparse: true,
            required: function () {
                return this.role === USER_ROLE.student;
            },
            validate: [
                {
                    validator: function (phone: string) {
                        if (this.role === USER_ROLE.student && !phone) {
                            return false;
                        }
                        return true;
                    },
                    message: 'Phone number is required for students',
                },
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
            unique: true,
            required: true,
            validate: [
                {
                    validator: function (email: string) {
                        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
                    },
                    message: 'Invalid email format',
                },
            ],
        },
        passwordChangedAt: { type: Date },
        isDeleted: { type: Boolean, default: false },
        status: {
            type: String,
            enum: {
                values: Object.values(USER_STATUS),
                message: '{VALUE} is not a valid status',
            },
            default: 'active',
        },
        role: {
            type: String,
            enum: {
                values: Object.values(USER_ROLE),
                message: `{VALUE} is not a valid role.Type must be anything from this: ${Object.values(USER_ROLE)}`,
            },
            required: [true, 'Role is required'],
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

// Hash password and add +88 to number if needed while saving to database
userSchema.pre('save', async function (next) {
    if (this.password && this.isModified('password')) {
        this.password = await bcrypt.hash(
            this.password,
            Number(config.bcrypt_salt),
        );
    }

    if (this.phone && this.isModified('phone')) {
        this.phone = formatPhoneNumber(this.phone);
    }

    next();
});

//  Check Password is correct
userSchema.statics.isPasswordMatched = async function (
    passwordFromReq: string,
    passwordInDB: string,
) {
    return await bcrypt.compare(passwordFromReq, passwordInDB);
};

// Check if JWT Token issued before before password changed
userSchema.statics.isJWTIssuedBeforePasswordChanged = function (
    passwordChangedTimeStamp: Date,
    jwtIssuedTimeStamp: number,
) {
    const passwordChangedTime =
        new Date(passwordChangedTimeStamp).getTime() / 1000;
    return passwordChangedTime > jwtIssuedTimeStamp;
};

// Create Model
export const User = model<IUser, IUserModel>('User', userSchema);

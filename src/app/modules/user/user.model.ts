import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import { IUserModel, TUser } from './user.interface';
import { USER_ROLE, USER_STATUS } from './user.constant';
import config from '../../config';

const userSchema = new Schema<TUser, IUserModel>(
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
        },
        phone: {
            type: String,
            unique: true,
        },
        email: {
            type: String,
            unique: true,
        },
        passwordChangedAt: { type: Date },
        isDeleted: { type: Boolean, default: false },
        status: {
            type: String,
            enum: { values: Object.values(USER_STATUS) },
            default: 'active',
        },
        role: {
            type: String,
            enum: { values: Object.values(USER_ROLE) },
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
        },
    },
);

// Hash password while saving to database
userSchema.pre('save', async function (next) {
    this.password = await bcrypt.hash(
        this.password,
        Number(config.bcrypt_salt),
    );
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
export const User = model<TUser, IUserModel>('User', userSchema);

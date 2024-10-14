/* eslint-disable no-unused-vars */

import { Model } from 'mongoose';
import { USER_ROLE, USER_STATUS } from './user.constant';

export type TUserRole = keyof typeof USER_ROLE;
export type TUserStatus = keyof typeof USER_STATUS;

export interface TUser {
    id: string;
    password: string;
    phone: string;
    email: string;
    passwordChangedAt: Date;
    isDeleted: boolean;
    status: TUserStatus;
    role: TUserRole;
}

export interface IUserModel extends Model<TUser> {
    isPasswordMatched(
        passwordFromReq: string,
        passwordInDB: string,
    ): Promise<boolean>;
    isJWTIssuedBeforePasswordChanged(
        passwordChangedTimeStamp: Date,
        jwtIssuedTimeStamp: number,
    ): boolean;
}

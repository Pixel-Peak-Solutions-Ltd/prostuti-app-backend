/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { IUser } from '../user/user.interface';
import { User } from '../user/user.model';
import AppError from '../../classes/errorClasses/AppError';
import { StatusCodes } from 'http-status-codes';
import { Student } from '../student/student.model';
import { ILoginStudent } from './auth.interface';
import { USER_ROLE, USER_STATUS } from '../user/user.constant';
import config from '../../config';
import { jwtHelpers } from '../../helpers/jwtHelpers/jwtHelpers';
import { formatPhoneNumber } from '../../utils/formatPhoneNumber';
import { PhoneVerification } from '../phoneVerification/phoneVerification.model';
import { PHONE_VERIFICATION_TYPE } from '../phoneVerification/phoneVerification.constant';
import { convertJWTExpireTimeToSeconds } from './auth.utils';

// Register Student
const registerStudent = async (
    otpCode: string,
    name: string,
    email: string,
    phone: string,
    password: string,
) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // Check if the phone number is verified
        const verifiedPhone = await PhoneVerification.findOne({
            phoneNumber: formatPhoneNumber(phone),
            phoneVerificationType: PHONE_VERIFICATION_TYPE.ACCOUNT_CREATION,
            verified: true,
            otpCode,
        });

        if (!verifiedPhone) {
            throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid OTP');
        }

        // Check if the phone number is verified
        await PhoneVerification.findOneAndDelete({
            phoneNumber: formatPhoneNumber(phone),
            phoneVerificationType: PHONE_VERIFICATION_TYPE.ACCOUNT_CREATION,
            verified: true,
            otpCode,
        });

        const user: Partial<IUser> = {
            registeredId: `SID${Date.now()}${Math.random().toString(36).slice(2, 7)}`,
            password,
            phone,
            email,
            role: USER_ROLE.student,
        };

        // Crate a user to User model (Transaction 1)
        const newUser = await User.create([user], { session });

        if (!newUser.length) {
            throw new AppError(StatusCodes.BAD_REQUEST, 'Fail to create user');
        }

        // Create a student to Student model (Transaction 2)

        const student = {
            user_id: newUser[0]._id,
            studentId: newUser[0].registeredId,
            name: name,
            email: newUser[0].email,
            phone: newUser[0].phone,
        };

        const newStudent = await Student.create([student], { session });

        if (!newStudent.length) {
            throw new AppError(
                StatusCodes.BAD_REQUEST,
                'Fail to create student',
            );
        }

        await session.commitTransaction();
        await session.endSession();
    } catch (error: any) {
        await session.abortTransaction();
        await session.endSession();

        throw error;
    }

    return null;
};

// Login User (student, teacher and admin)
const loginUser = async (payload: ILoginStudent) => {
    const { email, phone, password } = payload;

    const user = await User.findOne({
        ...(email ? { email } : { phone: formatPhoneNumber(phone) }),
    }).select('+password');

    // Check if the user exist in database
    if (!user) {
        throw new AppError(StatusCodes.NOT_FOUND, 'User is not found');
    }

    // Check if the user is already deleted
    if (user.isDeleted) {
        throw new AppError(StatusCodes.FORBIDDEN, 'User is deleted');
    }

    // Check if the user is blocked
    if (user.status === USER_STATUS.blocked) {
        throw new AppError(StatusCodes.FORBIDDEN, 'User is blocked');
    }

    // Check Password is correct
    if (!(await User.isPasswordMatched(password, user.password))) {
        throw new AppError(StatusCodes.FORBIDDEN, 'Invalid password!');
    }

    // Access Granted: Send Access Token

    // For student
    if (user.role === USER_ROLE.student) {
        const jwtPayload = { registeredId: user.registeredId, role: user.role };

        const accessTokenExpiresIn = convertJWTExpireTimeToSeconds(
            config.jwt_student_access_token_expires_in,
        );
        const refreshTokenExpiresIn = convertJWTExpireTimeToSeconds(
            config.jwt_student_refresh_token_expires_in,
        );

        const accessToken = jwtHelpers.createToken(
            jwtPayload,
            config.jwt_access_token_secret,
            config.jwt_student_access_token_expires_in,
        );

        const refreshToken = jwtHelpers.createToken(
            jwtPayload,
            config.jwt_refresh_token_secret,
            config.jwt_student_refresh_token_expires_in,
        );

        return {
            accessToken,
            accessTokenExpiresIn,
            refreshToken,
            refreshTokenExpiresIn,
            isStudent: true,
        };
    }
    // For teacher and admin
    else {
        const jwtPayload = { registeredId: user.registeredId, role: user.role };
        const refreshTokenExpiresIn = convertJWTExpireTimeToSeconds(
            config.jwt_refresh_token_expired_in,
        );

        const accessToken = jwtHelpers.createToken(
            jwtPayload,
            config.jwt_access_token_secret,
            config.jwt_access_token_expired_in,
        );

        const refreshToken = jwtHelpers.createToken(
            jwtPayload,
            config.jwt_refresh_token_secret,
            config.jwt_refresh_token_expired_in,
        );

        return {
            accessToken,
            refreshToken,
            refreshTokenExpiresIn,
            isStudent: false,
        };
    }
};

// Get refresh and access token for student
const getStudentRefreshToken = async (token: string) => {
    // Check if the given token is valid
    const decoded = jwtHelpers.verifyToken(
        token,
        config.jwt_refresh_token_secret,
    );

    const { registeredId, iat } = decoded;

    // Check if the user is exist
    const user = await User.findOne({ registeredId });

    if (!user) {
        throw new AppError(StatusCodes.NOT_FOUND, 'User not found!');
    }

    // Check the role
    if (user.role !== USER_ROLE.student) {
        throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized!');
    }

    // Check if the user is already deleted
    if (user?.isDeleted) {
        throw new AppError(StatusCodes.FORBIDDEN, 'User is deleted!');
    }

    // Check if the user is blocked
    if (user?.status === USER_STATUS.blocked) {
        throw new AppError(StatusCodes.FORBIDDEN, 'User is blocked!');
    }

    // Is JWT issued before password changed
    if (
        user.passwordChangedAt &&
        User.isJWTIssuedBeforePasswordChanged(
            user.passwordChangedAt,
            iat as number,
        )
    ) {
        throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized!');
    }

    const jwtPayload = { registeredId: user.registeredId, role: user.role };

    const accessTokenExpiresIn = convertJWTExpireTimeToSeconds(
        config.jwt_student_access_token_expires_in,
    );
    const refreshTokenExpiresIn = convertJWTExpireTimeToSeconds(
        config.jwt_student_refresh_token_expires_in,
    );

    const accessToken = jwtHelpers.createToken(
        jwtPayload,
        config.jwt_access_token_secret,
        config.jwt_student_access_token_expires_in,
    );

    const refreshToken = jwtHelpers.createToken(
        jwtPayload,
        config.jwt_refresh_token_secret,
        config.jwt_student_refresh_token_expires_in,
    );

    return {
        accessToken,
        accessTokenExpiresIn,
        refreshToken,
        refreshTokenExpiresIn,
    };
};

// Get refresh token for teacher admin
const getTeacherAdminRefreshToken = async (token: string) => {
    // Check if the given token is valid
    const decoded = jwtHelpers.verifyToken(
        token,
        config.jwt_refresh_token_secret,
    );

    const { registeredId, role, iat } = decoded;

    // Check if the user is exist
    const user = await User.findOne({ registeredId });

    if (!user) {
        throw new AppError(StatusCodes.NOT_FOUND, 'User not found!');
    }

    // Check the role
    if (user.role !== role) {
        throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized!');
    }
    // Check the role
    if (user.role === USER_ROLE.student) {
        throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized!');
    }

    // Check if the user is already deleted
    if (user?.isDeleted) {
        throw new AppError(StatusCodes.FORBIDDEN, 'User is deleted!');
    }

    // Check if the user is blocked
    if (user?.status === USER_STATUS.blocked) {
        throw new AppError(StatusCodes.FORBIDDEN, 'User is blocked!');
    }

    // Is JWT issued before password changed
    if (
        user.passwordChangedAt &&
        User.isJWTIssuedBeforePasswordChanged(
            user.passwordChangedAt,
            iat as number,
        )
    ) {
        throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized!');
    }

    // Create access token for teacher admin
    const jwtPayload = { registeredId: user.registeredId, role: user.role };
    const accessToken = jwtHelpers.createToken(
        jwtPayload,
        config.jwt_access_token_secret,
        config.jwt_student_access_token_expires_in,
    );

    return {
        accessToken,
    };
};

// Forget student password and Reset password
const resetStudentPassword = async (
    otpCode: string,
    phone: string,
    newPassword: string,
) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // Check if the phone number is verified
        const verifiedPhone = await PhoneVerification.findOne({
            phoneNumber: formatPhoneNumber(phone),
            phoneVerificationType: PHONE_VERIFICATION_TYPE.PASSWORD_RESET,
            verified: true,
            otpCode,
        });

        if (!verifiedPhone) {
            throw new AppError(
                StatusCodes.BAD_REQUEST,
                'Phone number is not verified',
            );
        }

        // Delete the verified number
        await PhoneVerification.findOneAndDelete({
            phoneNumber: formatPhoneNumber(phone),
            phoneVerificationType: PHONE_VERIFICATION_TYPE.PASSWORD_RESET,
            verified: true,
            otpCode,
        });
        // Check if the user is exist
        const user = await User.findOne({ phone: formatPhoneNumber(phone) });

        if (!user) {
            throw new AppError(StatusCodes.NOT_FOUND, 'User not found!');
        }

        // Check the role
        if (user.role !== USER_ROLE.student) {
            throw new AppError(
                StatusCodes.UNAUTHORIZED,
                'You are not authorized!',
            );
        }

        // Check if the user is already deleted
        if (user?.isDeleted) {
            throw new AppError(StatusCodes.FORBIDDEN, 'User is deleted!');
        }

        // Check if the user is blocked
        if (user?.status === USER_STATUS.blocked) {
            throw new AppError(StatusCodes.FORBIDDEN, 'User is blocked!');
        }

        // Update The password
        const newHashedPassword = await bcrypt.hash(
            newPassword,
            Number(config.bcrypt_salt),
        );

        await User.findOneAndUpdate(
            {
                phone: user.phone,
                role: user.role,
            },
            {
                password: newHashedPassword,
            },
        );

        await session.commitTransaction();
        session.endSession();
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }

    return null;
};

export const authService = {
    registerStudent,
    loginUser,
    getStudentRefreshToken,
    getTeacherAdminRefreshToken,
    resetStudentPassword,
};

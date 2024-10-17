/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import { IUser } from '../user/user.interface';
import { User } from '../user/user.model';
import AppError from '../../classes/errorClasses/AppError';
import { StatusCodes } from 'http-status-codes';
import { Student } from '../student/student.model';
import { ILoginStudent } from './auth.interface';
import { USER_STATUS } from '../user/user.constant';
import config from '../../config';
import { jwtHelpers } from '../../helpers/jwtHelpers/jwtHelpers';
import { formatPhoneNumber } from '../../utils/formatPhoneNumber';
import { PhoneVerification } from '../phoneVerification/phoneVerification.model';
import { PHONE_VERIFICATION_TYPE } from '../phoneVerification/phoneVerification.constant';

// Register Student
const registerStudent = async (
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
        });

        if (!verifiedPhone) {
            throw new AppError(
                StatusCodes.BAD_REQUEST,
                'Phone number is not verified',
            );
        }

        const user: Partial<IUser> = {
            id: `SID${Date.now()}${Math.random().toString(36).slice(2, 7)}`,
            password,
            phone,
            email,
            role: 'student',
        };

        // Crate a user to User model (Transaction 1)
        const newUser = await User.create([user], { session });

        if (!newUser.length) {
            throw new AppError(StatusCodes.BAD_REQUEST, 'Fail to create user');
        }

        // Create a student to Student model (Transaction 2)

        const student = {
            userId: newUser[0]._id,
            studentId: newUser[0].id,
            studentName: name,
            studentEmail: email,
            studentPhone: newUser[0].phone,
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
    const jwtPayload = { userId: user.id, role: user.role };
    const accessToken = jwtHelpers.createToken(
        jwtPayload,
        config.jwt_access_secret as string,
        config.jwt_access_expired_in as string,
    );

    return {
        accessToken,
    };
};

export const authService = {
    registerStudent,
    loginUser,
};

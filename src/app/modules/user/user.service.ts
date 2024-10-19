/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import { IUser } from './user.interface';
import { User } from './user.model';
import AppError from '../../classes/errorClasses/AppError';
import { StatusCodes } from 'http-status-codes';
import { Teacher } from '../teacher/teacher.model';
import { Admin } from '../admin/admin.model';

// Create Teacher
const createTeacher = async (email: string, password: string) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const user: Partial<IUser> = {
            registeredId: `TID${Date.now()}${Math.random().toString(36).slice(2, 7)}`,
            email,
            password,
            role: 'teacher',
        };

        // Crate a user to User model (Transaction 1)
        const newUser = await User.create([user], { session });

        if (!newUser.length) {
            throw new AppError(StatusCodes.BAD_REQUEST, 'Fail to create user');
        }

        // Create a teacher to Teacher model (Transaction 2)
        const teacher = {
            user_id: newUser[0]._id,
            teacherId: newUser[0].registeredId,
            email: newUser[0].email,
        };

        const newTeacher = await Teacher.create([teacher], { session });

        if (!newTeacher.length) {
            throw new AppError(
                StatusCodes.BAD_REQUEST,
                'Fail to create Teacher',
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

// Create Admin
const createAdmin = async (email: string, password: string) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const user: Partial<IUser> = {
            registeredId: `AID${Date.now()}${Math.random().toString(36).slice(2, 7)}`,
            email,
            password,
            role: 'admin',
        };

        // Crate a user to User model (Transaction 1)
        const newUser = await User.create([user], { session });

        if (!newUser.length) {
            throw new AppError(StatusCodes.BAD_REQUEST, 'Fail to create user');
        }

        // Create a teacher to Teacher model (Transaction 2)
        const admin = {
            user_id: newUser[0]._id,
            adminId: newUser[0].registeredId,
            email: newUser[0].email,
        };

        const newAdmin = await Admin.create([admin], { session });

        if (!newAdmin.length) {
            throw new AppError(StatusCodes.BAD_REQUEST, 'Fail to create Admin');
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

export const userService = {
    createTeacher,
    createAdmin,
};

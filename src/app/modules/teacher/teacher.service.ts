import { StatusCodes } from 'http-status-codes';
import AppError from '../../classes/errorClasses/AppError';
import { TJWTDecodedUser } from '../../interfaces/jwt/jwt.type';
import { User } from '../user/user.model';
import { ITeacher } from './teacher.interface';
import { Teacher } from './teacher.model';

const updateTeacher = async (
    teacherId: string,
    payload: Partial<ITeacher>,
    user: TJWTDecodedUser,
) => {
    // Check if the params teacherId match to database teacherId for this token
    const teacher = await User.findById(user.userId);

    if (teacher?.registeredId !== teacherId) {
        throw new AppError(
            StatusCodes.UNAUTHORIZED,
            'Access denied. You are not authorized to update this profile',
        );
    }

    // Update the user
    const { name, phone, subject, jobType } = payload;

    const result = await Teacher.findOneAndUpdate(
        { teacherId },
        { name, phone, subject, jobType },
        {
            new: true,
            runValidators: true,
        },
    );
    return result;
};

export const teacherService = {
    updateTeacher,
};

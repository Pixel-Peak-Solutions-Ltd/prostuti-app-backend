import { StatusCodes } from 'http-status-codes';
import AppError from '../../classes/errorClasses/AppError';
import { TJWTDecodedUser } from '../../interfaces/jwt/jwt.type';
import { User } from '../user/user.model';
import { ITeacher } from './teacher.interface';
import { Teacher } from './teacher.model';
import { Express } from 'express';
import fs from 'fs';

const updateTeacher = async (
    teacherId: string,
    payload: Partial<ITeacher>,
    user: TJWTDecodedUser,
    file: Express.Multer.File | undefined,
    url: string | undefined
) => {
    // Check if the params teacherId match to database teacherId for this token
    const teacher = await User.findById(user.userId);

    if (teacher?.registeredId !== teacherId) {
        throw new AppError(
            StatusCodes.UNAUTHORIZED,
            'Access denied. You are not authorized to update this profile',
        );
    }

    if (file !== undefined && url !== undefined) {
        const image = {
            url,
            diskType: file?.mimetype,
            path: file?.path,
            originalName: file?.originalname,
            modifiedName: file?.filename
        }
        payload = { ...payload, image };
    }

    // Update the user
    const result = await Teacher.findOneAndUpdate(
        { teacherId },
        // { name, phone, subject, jobType, image },
        payload,
        {
            new: true,
            runValidators: true,
        },
    );

    // removing the image from the filesystem
    if (result?.image) {
        fs.unlink(result?.image.path, (err) => {
            if (err) {
                return;
            }
            console.log(`File ${result.image?.path} has been successfully removed.`);
        })
    }

    return result;
};

export const teacherService = {
    updateTeacher,
};

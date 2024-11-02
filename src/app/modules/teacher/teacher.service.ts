/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { StatusCodes } from 'http-status-codes';
import AppError from '../../classes/errorClasses/AppError';
import { TJWTDecodedUser } from '../../interfaces/jwt/jwt.type';
import { User } from '../user/user.model';
import { ITeacher, TUpdatePayloadType } from './teacher.interface';
import { Teacher } from './teacher.model';
import { Express } from 'express';
import { deleteFromB2, uploadToB2 } from '../../utils/backBlaze';
import config from '../../config';

const updateTeacher = async (
    teacherId: string,
    payload: Partial<ITeacher>,
    user: TJWTDecodedUser,
    file: Express.Multer.File | undefined,
) => {
    // Check if the params teacherId match to database teacherId for this token
    const teacher = await User.findById(user.userId);

    if (teacher?.registeredId !== teacherId) {
        throw new AppError(
            StatusCodes.UNAUTHORIZED,
            'Access denied. You are not authorized to update this profile',
        );
    }

    // Get existing teacher to check for old image
    const existingTeacher = await Teacher.findOne({ teacherId });
    if (!existingTeacher) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Teacher not found');
    }

    // Only pick allowed fields from payload
    const updatedPayload: TUpdatePayloadType = {
        ...(payload.name && { name: payload.name }),
        ...(payload.phone && { phone: payload.phone }),
        ...(payload.subject && { subject: payload.subject }),
        ...(payload.jobType && { jobType: payload.jobType }),
    };

    // Handle image update if file exists
    if (file) {
        try {
            // First upload the new image
            const newImage = await uploadToB2(
                file,
                config.backblaze_teacher_bucket,
            );

            // If upload successful, update the payload
            updatedPayload.image = newImage;

            // Then try to delete the old image asynchronously
            if (
                existingTeacher.image?.fileId &&
                existingTeacher.image!.modifiedName
            ) {
                // Use Promise.resolve to handle deletion asynchronously
                Promise.resolve().then(() => {
                    deleteFromB2(
                        existingTeacher.image!.fileId,
                        existingTeacher.image!.modifiedName,
                    ).catch((error) => {
                        // Log the error but don't affect the main operation
                        console.error('Failed to delete old image:', error);
                        // You might want to store failed deletions in a separate collection
                        // for later cleanup
                    });
                });
            }
        } catch (error) {
            // Here we specifically catch upload errors
            if (error instanceof AppError) {
                throw error; // Rethrow AppError with custom message
            }
            throw new AppError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                'Failed to process image update',
            );
        }
    }

    // Remove any undefined fields using type-safe approach
    const filteredPayload: TUpdatePayloadType = Object.fromEntries(
        Object.entries(updatedPayload).filter(
            ([_, value]) => value !== undefined,
        ),
    ) as TUpdatePayloadType;

    // Update the teacher only if there are fields to update
    if (Object.keys(filteredPayload).length === 0) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'No valid fields provided for update',
        );
    }

    // Update the teacher
    const result = await Teacher.findOneAndUpdate(
        { teacherId },
        updatedPayload,
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

/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { StatusCodes } from 'http-status-codes';
import { TJWTDecodedUser } from '../../interfaces/jwt/jwt.type';
import { User } from '../user/user.model';
import { IStudent, TUpdatePayloadType } from './student.interface';
import { Express } from 'express';
import AppError from '../../classes/errorClasses/AppError';
import { Student } from './student.model';
import { deleteFromB2, uploadToB2 } from '../../utils/backBlaze';
import config from '../../config';

const createStudent = async () => {
    return 'createStudent service';
};

const getAllStudents = async () => {
    return 'getAllStudents service';
};

const getStudentByID = async () => {
    return 'getStudentByID service';
};

const updateStudent = async (
    studentId: string,
    payload: Partial<IStudent>,
    user: TJWTDecodedUser,
    file: Express.Multer.File | undefined,
) => {
    // Check if the params teacherId match to database teacherId for this token
    const student = await User.findById(user.userId);

    if (student?.registeredId !== studentId) {
        throw new AppError(
            StatusCodes.UNAUTHORIZED,
            'Access denied. You are not authorized to update this profile',
        );
    }

    // Get existing teacher to check for old image
    const existingStudent = await Student.findOne({ studentId });
    if (!existingStudent) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Student not found');
    }

    // Only pick allowed fields from payload
    const updatedPayload: TUpdatePayloadType = {
        ...(payload.name && { name: payload.name }),
        ...(payload.categoryType && { categoryType: payload.categoryType }),
    };

    // Handle image update if file exists
    if (file) {
        try {
            // First upload the new image
            const newImage = await uploadToB2(
                file,
                config.backblaze_all_users_bucket_name,
                config.backblaze_all_users_bucket_id,
                'profile',
            );

            // If upload successful, update the payload
            updatedPayload.image = newImage;

            // Then try to delete the old image asynchronously
            if (
                existingStudent.image?.fileId &&
                existingStudent.image!.modifiedName
            ) {
                // Use Promise.resolve to handle deletion asynchronously
                Promise.resolve().then(() => {
                    deleteFromB2(
                        existingStudent.image!.fileId,
                        existingStudent.image!.modifiedName,
                        'profile',
                    ).catch((error) => {
                        // Log the error but don't affect the main operation
                        console.error('Failed to delete old image');
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
    const result = await Student.findOneAndUpdate(
        { studentId },
        updatedPayload,
        {
            new: true,
            runValidators: true,
        },
    );

    return result;
};

const deleteUserByID = async () => {
    return 'deleteUserByID service';
};

export const studentService = {
    createStudent,
    getAllStudents,
    getStudentByID,
    updateStudent,
    deleteUserByID,
};

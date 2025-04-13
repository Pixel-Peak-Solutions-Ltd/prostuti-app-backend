/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { StatusCodes } from 'http-status-codes';
import fs from 'fs';
import { TJWTDecodedUser } from '../../interfaces/jwt/jwt.type';
import { User } from '../user/user.model';
import { IStudent, TUpdatePayloadType } from './student.interface';
import { Express } from 'express';
import AppError from '../../classes/errorClasses/AppError';
import { Student } from './student.model';
import { deleteFromB2, uploadToB2 } from '../../utils/backBlaze';
import config from '../../config';
import { getValidSubCategories, MainCategory } from '../auth/category/category.constant';

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
    // Check if there are fields to update
    if (Object.keys(payload).length === 0) {
        // Delete local file after upload
        if (file) fs.unlinkSync(file.path);
        // Throw Error
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'No valid fields provided for update',
        );
    }
    // Check if the params teacherId match to database teacherId for this token
    const student = await User.findById(user.userId);

    if (student?.registeredId !== studentId) {
        // Delete local file after upload
        if (file) fs.unlinkSync(file.path);
        // Throw Error
        throw new AppError(
            StatusCodes.UNAUTHORIZED,
            'Access denied. You are not authorized to update this profile',
        );
    }

    // Get existing teacher to check for old image
    const existingStudent = await Student.findOne({ studentId });
    if (!existingStudent) {
        // Delete local file after upload
        if (file) fs.unlinkSync(file.path);
        // Throw Error
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
                // Delete local file after upload
                fs.unlinkSync(file.path);
                // Throw Error
                throw error; // Rethrow AppError with custom message
            }
            // Delete local file after upload
            fs.unlinkSync(file.path);
            // Throw Error
            throw new AppError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                'Failed to process image update',
            );
        }
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



const updateStudentCategory = async (userId: string, payload: { mainCategory: string; subCategory?: string }) => {
    // Validate that this is a valid category combination
    if (payload.mainCategory !== MainCategory.JOB && !payload.subCategory) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            `Subcategory is required for ${payload.mainCategory}`
        );
    }

    // If there's a subcategory, validate it
    if (payload.subCategory) {
        const validSubcategories = getValidSubCategories(payload.mainCategory);
        if (!validSubcategories.includes(payload.subCategory)) {
            throw new AppError(
                StatusCodes.BAD_REQUEST,
                `Invalid subcategory. Valid subcategories for ${payload.mainCategory} are: ${validSubcategories.join(', ')}`
            );
        }
    }

    // For Job category, remove any subcategory
    if (payload.mainCategory === MainCategory.JOB) {
        delete payload.subCategory;
    }

    // Create the category object
    const categoryObj = {
        mainCategory: payload.mainCategory,
        ...(payload.subCategory && { subCategory: payload.subCategory }),
    };

    // Find the student by the user_id and update their category
    const updatedStudent = await Student.findOneAndUpdate(
        { user_id: userId }, // Find by user_id from JWT token
        {
            categoryType: payload.mainCategory,
            category: categoryObj
        },
        { new: true }
    );

    if (!updatedStudent) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Student not found');
    }

    return updatedStudent;
};

// Add to exports
export const studentService = {
    createStudent,
    getAllStudents,
    getStudentByID,
    updateStudent,
    updateStudentCategory, // New method
    deleteUserByID,
};

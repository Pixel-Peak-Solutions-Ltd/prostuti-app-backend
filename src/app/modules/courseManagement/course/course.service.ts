/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { StatusCodes } from 'http-status-codes';
import fs from 'fs';
import mongoose, { Types } from 'mongoose';
import AppError from '../../../classes/errorClasses/AppError';
import config from '../../../config';
import { TJWTDecodedUser } from '../../../interfaces/jwt/jwt.type';
import { deleteFromB2, uploadToB2 } from '../../../utils/backBlaze';
import { ICourse } from './course.interface';
import { Course } from './course.model';
import { Express } from 'express';
import { USER_ROLE } from '../../user/user.constant';

// Create Course
const createCourse = async (
    user: TJWTDecodedUser,
    payload: Partial<ICourse>,
    file: Express.Multer.File | undefined,
) => {
    // Check if file exists
    if (!file) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'Course cover image is required',
        );
    }

    // Upload image to BackBlaze
    const uploadedImage = await uploadToB2(
        file,
        config.backblaze_all_users_bucket_name,
        config.backblaze_all_users_bucket_id,
        'courseCoverImage',
    );

    // Create course object with uploaded image
    const courseData: Partial<ICourse> = {
        teacher_id: new Types.ObjectId(user.userId),
        name: payload.name,
        category: payload.category,
        details: payload.details,
        image: uploadedImage,
    };

    // Create new course
    const newCourse = await Course.create(courseData);

    return newCourse;
};

// Course Preview
const getCoursePreview = async (courseId: string) => {
    // Aggregate course preview with optimized lookup
    const coursePreview = await Course.aggregate([
        // Match the specific course
        { $match: { _id: new mongoose.Types.ObjectId(courseId) } },

        // Lookup lessons with optimized pipeline
        {
            $lookup: {
                from: 'lessons',
                localField: '_id',
                foreignField: 'course_id',
                as: 'lessons',
                pipeline: [
                    { $sort: { number: 1 } }, // Sort lessons in order
                    {
                        $lookup: {
                            from: 'recodedclasses',
                            localField: '_id',
                            foreignField: 'lesson_id',
                            as: 'recodedClasses',
                        },
                    },
                    {
                        $lookup: {
                            from: 'resources',
                            localField: '_id',
                            foreignField: 'lesson_id',
                            as: 'resources',
                        },
                    },
                    {
                        $lookup: {
                            from: 'assignments',
                            localField: '_id',
                            foreignField: 'lesson_id',
                            as: 'assignments',
                        },
                    },
                    {
                        $lookup: {
                            from: 'tests',
                            localField: '_id',
                            foreignField: 'lesson_id',
                            as: 'tests',
                        },
                    },
                ],
            },
        },

        // Project to shape the output
        {
            $project: {
                _id: 1,
                name: 1,
                details: 1,
                image: 1,
                lessons: {
                    _id: 1,
                    number: 1,
                    name: 1,
                    recodedClasses: {
                        _id: 1,
                        recodeClassName: 1,
                        classDetails: 1,
                        classDate: 1,
                        classVideoURL: 1,
                    },
                    assignments: {
                        _id: 1,
                        assignmentNo: 1,
                        marks: 1,
                        details: 1,
                        uploadFileResources: 1,
                    },
                    resources: {
                        _id: 1,
                        name: 1,
                        resourceDate: 1,
                        uploadFileResources: 1,
                    },
                    tests: {
                        _id: 1,
                        name: 1,
                        type: 1,
                        time: 1,
                        publishDate: 1,
                        questionList: 1,
                    },
                },
            },
        },
    ]);

    // Handle case when no course is found
    if (!coursePreview.length) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Course not found');
    }

    return coursePreview[0];
};

const getAllCourses = async () => {
    // Get all courses
    const courses = await Course.find({});

    return courses;
};

const getCourseByID = async (courseId: string) => {
    const courses = await Course.findById(courseId);

    return courses;
};

// Update Course
const updateCourse = async (
    courseId: string,
    payload: Partial<ICourse>,
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

    // Check if the course exists
    const existingCourse = await Course.findById(courseId);
    if (!existingCourse) {
        // Delete local file after upload
        if (file) fs.unlinkSync(file.path);
        // Throw Error
        throw new AppError(StatusCodes.NOT_FOUND, 'Course not found');
    }

    // Check if the user is the teacher of the course
    if (user.role === USER_ROLE.teacher) {
        if (existingCourse.teacher_id.toString() !== user.userId) {
            // Delete local file after upload
            if (file) fs.unlinkSync(file.path);
            // Throw Error
            throw new AppError(
                StatusCodes.UNAUTHORIZED,
                'Access denied. You are not authorized to update this course',
            );
        }
    }

    // Create the updated payload
    const updatedPayload: Partial<ICourse> = {
        ...(payload.name && { name: payload.name }),
        ...(payload.category && { category: payload.category }),
        ...(payload.details && { details: payload.details }),
    };

    // Handle image update if file exists
    if (file) {
        try {
            // First upload the new image
            const newImage = await uploadToB2(
                file,
                config.backblaze_all_users_bucket_name,
                config.backblaze_all_users_bucket_id,
                'courseCoverImage',
            );

            // If upload successful, update the payload
            updatedPayload.image = newImage;

            // Then try to delete the old image asynchronously
            if (
                existingCourse.image?.fileId &&
                existingCourse.image?.modifiedName
            ) {
                // Use Promise.resolve to handle deletion asynchronously
                Promise.resolve().then(() => {
                    deleteFromB2(
                        existingCourse.image.fileId,
                        existingCourse.image.modifiedName,
                        'courses',
                    ).catch((error) => {
                        console.error('Failed to delete old course image');
                        // You might want to store failed deletions in a separate collection for later cleanup
                    });
                });
            }
        } catch (error) {
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

    // Update the course
    const result = await Course.findByIdAndUpdate(courseId, updatedPayload, {
        new: true,
        runValidators: true,
    });

    return result;
};

const deleteCourseByID = async (courseId: string) => {
    // Check if the course exists
    const existingCourse = await Course.findById(courseId);
    if (!existingCourse) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Course not found');
    }

    // Delete the course image from Backblaze storage
    if (existingCourse.image?.fileId && existingCourse.image?.modifiedName) {
        await deleteFromB2(
            existingCourse.image.fileId,
            existingCourse.image.modifiedName,
            'courses',
        );
    }

    // Delete the course from the database
    await Course.findByIdAndDelete(courseId);

    return null;
};

export const courseService = {
    createCourse,
    getCoursePreview,
    getAllCourses,
    getCourseByID,
    updateCourse,
    deleteCourseByID,
};

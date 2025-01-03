import { StatusCodes } from 'http-status-codes';
import AppError from '../../../classes/errorClasses/AppError';
import { IRecodedClass } from './recodedClass.interface';
import { RecodedClass } from './recodedClass.model';
import { Course } from '../course/course.model';
import { Lesson } from '../lesson/lesson.model';
import { Express } from 'express';
import config from '../../../config';
import { deleteFromB2, uploadToB2 } from '../../../utils/backBlaze';
import fs from 'fs';

// Create Recoded Class
const createRecodedClass = async (
    payload: Partial<IRecodedClass>,
    file: Express.Multer.File | undefined,
) => {
    // Check if the course exist
    const isCourseExist = await Course.findById(payload.course_id);
    if (!isCourseExist) {
        throw new AppError(
            StatusCodes.NOT_FOUND,
            'Course does not exist with this ID',
        );
    }

    // Check if the course exist
    const isLessonExist = await Lesson.findById(payload.lesson_id);
    if (!isLessonExist) {
        throw new AppError(
            StatusCodes.NOT_FOUND,
            'Lesson does not exist with this ID',
        );
    }

    // Check if the lesson belongs to of that course
    const isLessonBelongsToCourse = await Lesson.findOne({
        _id: payload.lesson_id,
        course_id: payload.course_id,
    });

    if (!isLessonBelongsToCourse) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'The lesson does not belong to the course',
        );
    }

    // Check if the recoded class already added for this course under that lesson
    // const isRecodedClassAdded = await RecodedClass.findOne({
    //     course_id: payload.course_id,
    //     lesson_id: payload.lesson_id,
    // });

    // if (isRecodedClassAdded) {
    //     throw new AppError(
    //         StatusCodes.BAD_REQUEST,
    //         'Already recoded class(es) added for this lesson',
    //     );
    // }

    // Handle image update if file exists

    if (file) {
        try {
            // First upload the new image
            const newVideo = await uploadToB2(
                file,
                config.backblaze_all_users_bucket_name,
                config.backblaze_all_users_bucket_id,
                'videos',
            );

            // If upload successful, update the payload
            payload.classVideoURL = newVideo;

            // Then try to delete the old image asynchronously
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

    const result = await RecodedClass.create({ ...payload });

    return result;
};

// GEt all Recoded classes of a Course with Lesson name
const getAllCourseRecodedClassWithLessons = async (courseId: string) => {
    // Check if the course exist
    const isCourseExist = await Course.findById(courseId);
    if (!isCourseExist) {
        throw new AppError(
            StatusCodes.NOT_FOUND,
            'Course does not exist with this ID',
        );
    }

    // Fetch recoded classes and populate the lesson_id field
    const recodedClasses = await RecodedClass.find({
        course_id: courseId,
    })
        .populate({
            path: 'lesson_id',
            select: 'number name',
            model: Lesson,
        })
        .select({
            classVideoURL: 1,
            recodeClassName: 1,
            classDate: 1,
            isCompleted: 1,
        });

    return recodedClasses;
};

// Get All Recoded Class
const getAllRecodedClass = async () => {
    const result = await RecodedClass.find({});

    return result;
};

// Get Recoded Class By ID
const getRecodedClassByID = async (recodedClassId: string) => {
    const results = await RecodedClass.findById(recodedClassId);

    if (!results) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Course not found');
    }

    return results;
};

// Update Recoded Class
const updateRecodedClass = async (
    recodedClassId: string,
    payload: Partial<IRecodedClass>,
    file: Express.Multer.File | undefined,
) => {
    // Check if there are fields to update
    if (Object.keys(payload).length === 0) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'No valid fields provided for update',
        );
    }

    // Check if the recoded class exists
    const isRecodedClassExist = await RecodedClass.findById(recodedClassId);
    if (!isRecodedClassExist) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Recoded class not found');
    }

    // Filter out the fields to update
    const updatedPayload: Partial<IRecodedClass> = {
        ...(payload.recodeClassName && {
            recodeClassName: payload.recodeClassName,
        }),
        ...(payload.classDate && { classDate: payload.classDate }),
        ...(payload.classDetails && { classDetails: payload.classDetails }),
    };

    // Upload the new file
    if (file) {
        try {
            // First upload the new image
            const newVideo = await uploadToB2(
                file,
                config.backblaze_all_users_bucket_name,
                config.backblaze_all_users_bucket_id,
                'videos',
            );

            // If upload successful, update the payload
            updatedPayload.classVideoURL = newVideo;

            // Then try to delete the old image asynchronously
            await deleteFromB2(
                isRecodedClassExist.classVideoURL.fileId,
                isRecodedClassExist.classVideoURL.modifiedName,
                'videos',
            );
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

    // Update the record in the database
    const updatedRecodedClass = await RecodedClass.findByIdAndUpdate(
        recodedClassId,
        updatedPayload,
        { new: true, runValidators: true },
    );

    return updatedRecodedClass;
};

// mark record class as complete

const markAsComplete = async (recordedClassId: string) => {
    // Checking if the course exists
    const existingRecodedClass = await RecodedClass.findById(recordedClassId);
    if (!existingRecodedClass) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Course not found');
    }

    const completeWatchingRecordClass = await RecodedClass.findByIdAndUpdate(
        recordedClassId,
        { isCompleted: true },
        { new: true },
    );

    return completeWatchingRecordClass;
};

// Delete Recoded Class By ID
const deleteRecodedClassByID = async (recodedClassId: string) => {
    // Check if the course exists
    const isRecodedClassExist = await RecodedClass.findById(recodedClassId);
    if (!isRecodedClassExist) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Course not found');
    }

    // Then try to delete the old image asynchronously
    await deleteFromB2(
        isRecodedClassExist.classVideoURL.fileId,
        isRecodedClassExist.classVideoURL.modifiedName,
        'videos',
    );

    // Delete the course from the database
    await RecodedClass.findByIdAndDelete(recodedClassId);

    return null;
};

export const recodedClassService = {
    createRecodedClass,
    getAllCourseRecodedClassWithLessons,
    getAllRecodedClass,
    getRecodedClassByID,
    updateRecodedClass,
    deleteRecodedClassByID,
    markAsComplete,
};

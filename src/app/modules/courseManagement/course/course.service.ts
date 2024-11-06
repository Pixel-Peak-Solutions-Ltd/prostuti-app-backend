import { StatusCodes } from 'http-status-codes';
import AppError from '../../../classes/errorClasses/AppError';
import { ICourse } from './course.interface';
import { Express } from 'express';
import config from '../../../config';
import { uploadToB2 } from '../../../utils/backBlaze';
import { Course } from './course.model';
import { TJWTDecodedUser } from '../../../interfaces/jwt/jwt.type';
import { Types } from 'mongoose';

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

const getAllCourses = async () => {
    return 'getAllCourses';
};

const getCourseByID = async () => {
    return 'getCourseByID';
};

const updateCourse = async () => {
    return 'updateCourse';
};

const deleteCourseByID = async () => {
    return 'deleteCourseByID';
};

export const courseService = {
    createCourse,
    getAllCourses,
    getCourseByID,
    updateCourse,
    deleteCourseByID,
};

import { StatusCodes } from 'http-status-codes';
import AppError from '../../classes/errorClasses/AppError';
import { Course } from '../courseManagement/course/course.model';
import { ICourseReview } from './courseReview.interface';
import { TJWTDecodedUser } from '../../interfaces/jwt/jwt.type';
import { Student } from '../student/student.model';
import { CourseReview } from './courseReview.model';

const createCourseReview = async (
    user: TJWTDecodedUser,
    payload: ICourseReview,
) => {
    const isCourseExists = await Course.findById(payload.course_id).exec();

    if (!isCourseExists) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Course not found');
    }

    const isStudentExist = await Student.findOne({
        user_id: user.userId,
    }).exec();

    if (!isStudentExist) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Student not found');
    }

    const student_id = isStudentExist._id;

    const review = await CourseReview.create({
        ...payload,
        student_id,
    });

    return review;
};

const getAllReviewsOfACourse = async (courseId: string) => {
    const isCourseExists = await Course.findById(courseId).exec();

    if (!isCourseExists) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Course not found');
    }

    const reviews = await CourseReview.find({ course_id: courseId }).populate({
        path: 'student_id',
        select: 'user_id studentId name email phone image',
        model: Student,
    });

    return reviews;
};

export const courseReviewService = {
    createCourseReview,
    getAllReviewsOfACourse,
};

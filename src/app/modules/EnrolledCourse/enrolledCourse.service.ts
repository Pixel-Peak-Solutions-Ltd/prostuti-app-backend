import { StatusCodes } from 'http-status-codes';
import AppError from '../../classes/errorClasses/AppError';
import { TJWTDecodedUser } from '../../interfaces/jwt/jwt.type';
import { Course } from '../courseManagement/course/course.model';
import { Student } from '../student/student.model';
import { EnrolledCourse } from './enrolledCourse.model';
import mongoose from 'mongoose';

const createFreeEnrolledCourse = async (
    userInfo: TJWTDecodedUser,
    payload: { course_id: string[] },
): Promise<any> => {
    const { course_id } = payload;

    // Get student details
    const studentDetails = await Student.findOne({ user_id: userInfo.userId });
    if (!studentDetails) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Student does not exist');
    }

    // Check if all course IDs are valid
    const courses = await Course.find({ _id: { $in: course_id } });

    // If courses not found
    if (courses.length !== course_id.length) {
        throw new AppError(
            StatusCodes.NOT_FOUND,
            'One or more courses are not found.',
        );
    }

    // Check if all courses are free
    const nonFreeCourse = courses.find((course) => course.priceType !== 'Free');
    if (nonFreeCourse) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'One or more courses are not free.',
        );
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Enroll courses
        for (const course of courses) {
            // Check if already enrolled in this course
            const existingEnrollment = await EnrolledCourse.findOne(
                {
                    student_id: studentDetails._id,
                    course_id: course._id,
                }
            );

            if (existingEnrollment) {
                throw new AppError(
                    StatusCodes.CONFLICT,
                    `Already enrolled in the course: ${course.name}`,
                );
            }

            // Create new enrollment
            const newEnrolledCourse = await EnrolledCourse.create(
                [
                    {
                        student_id: studentDetails._id,
                        course_id: course._id,
                        enrollmentType: 'Free',
                    },
                ],
                { session }
            );

            if (!newEnrolledCourse || newEnrolledCourse.length === 0) {
                throw new AppError(
                    StatusCodes.BAD_REQUEST,
                    'Failed to enroll in the course.',
                );
            }

            // Update student with the new enrolled course
            const updatedStudent = await Student.findByIdAndUpdate(
                studentDetails._id,
                {
                    $push: { enrolledCourses: newEnrolledCourse[0]._id },
                },
                { session, new: true } 
            );

            if (!updatedStudent) {
                throw new AppError(
                    StatusCodes.BAD_REQUEST,
                    'Failed to update student enrollment.',
                );
            }
        }

        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        await session.endSession();
    }
};



export const EnrolledCourseService = {
    createFreeEnrolledCourse,
};

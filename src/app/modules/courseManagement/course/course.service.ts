/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { ICourse, TPriceType } from './course.interface';
import { Course } from './course.model';
import { Express } from 'express';
import { USER_ROLE } from '../../user/user.constant';
import { Student } from '../../student/student.model';
import { Teacher } from '../../teacher/teacher.model';
import { User } from '../../user/user.model';
import { notificationService } from '../../notification/notification.service';
import { Voucher } from '../../voucher/voucher.model';
import QueryBuilder from './courseQueryBuilder';

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
    const checkTeacher = await Teacher.findOne({
        user_id: user.userId,
    });
    if (!checkTeacher) {
        // Delete local file after upload
        fs.unlinkSync(file.path);
        // Throw Error
        throw new AppError(StatusCodes.BAD_REQUEST, 'Teacher not found');
    }

    // Create course object with uploaded image
    const courseData: Partial<ICourse> = {
        teacher_id: checkTeacher._id,
        name: payload.name,
        category_id: payload.category_id,
        details: payload.details,
        image: uploadedImage,
    };

    // Create new course
    const newCourse = await Course.create(courseData);

    return newCourse;
};

// Get All courses
const getAllCourses = async () => {
    const courses = await Course.find({ isPending: false, isPublished: true });

    return courses;
};

// Course Preview
const getCoursePreview = async (courseId: string) => {
    const coursePreview = await Course.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(courseId) } },
        {
            $lookup: {
                from: 'lessons',
                localField: '_id',
                foreignField: 'course_id',
                as: 'lessons',
                pipeline: [
                    {
                        $addFields: {
                            numericNumber: {
                                $toInt: {
                                    $getField: {
                                        input: {
                                            $regexFind: {
                                                input: '$number',
                                                regex: '\\d+',
                                            },
                                        },
                                        field: 'match',
                                    },
                                },
                            },
                        },
                    },
                    { $sort: { numericNumber: 1 } },
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
                    {
                        $project: {
                            _id: 1,
                            number: 1,
                            name: 1,
                            recodedClassesCount: { $size: '$recodedClasses' },
                            resourcesCount: { $size: '$resources' },
                            assignmentsCount: { $size: '$assignments' },
                            testsCount: { $size: '$tests' },
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
                                unlockDate: 1,
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
                            },
                        },
                    },
                ],
            },
        },
        {
            $project: {
                _id: 1,
                name: 1,
                details: 1,
                image: 1,
                totalLessons: { $size: '$lessons' },
                totalRecodedClasses: { $sum: '$lessons.recodedClassesCount' },
                totalResources: { $sum: '$lessons.resourcesCount' },
                totalAssignments: { $sum: '$lessons.assignmentsCount' },
                totalTests: { $sum: '$lessons.testsCount' },
                lessons: 1,
                priceType: 1,
                price: 1,
            },
        },
    ]);

    if (!coursePreview.length) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Course not found');
    }

    return coursePreview[0];
};

const getPublishedCoursesForStudent = async (user: TJWTDecodedUser) => {
    const studentProfile = await Student.findOne({ user_id: user.userId });

    // Get all  courses
    // Use aggregation to efficiently filter courses
    const courses = await Course.aggregate([
        // Match published and non-pending courses
        {
            $match: {
                isPending: false,
                isPublished: true,
            },
        },
        // Lookup category details
        {
            $lookup: {
                from: 'categories', // Ensure this matches your categories collection name
                localField: 'category_id',
                foreignField: '_id',
                as: 'category',
            },
        },
        // Unwind the category array
        {
            $unwind: '$category',
        },
        // Filter courses matching student's categoryType
        {
            $match: {
                'category.type': studentProfile!.categoryType,
            },
        },
        // Optional: Project only needed fields to reduce payload
        {
            $project: {
                name: 1,
                details: 1,
                image: 1,
                price: 1,
                priceType: 1,
                teacher_id: 1,
                category: 1,
            },
        },
    ]);

    return courses;
};

const getCourseByID = async (courseId: string) => {
    const courses = await Course.findById(courseId);

    return courses;
};

const getCourseByTeacherID = async (
    user_id: string,
    query: Record<string, unknown>,
) => {
    const checkTeacher = await Teacher.findOne({
        user_id: user_id,
    });
    if (!checkTeacher) {
        // Throw Error
        throw new AppError(StatusCodes.BAD_REQUEST, 'Teacher not found');
    }

    const coursesQuery = new QueryBuilder(
        Course.find({ teacher_id: checkTeacher._id }),
        query,
    )
        .filter()
        .sort()
        .paginate();

    const courses = await coursesQuery.modelQuery;

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

const approvedCourse = async (
    courseId: string,
    user: TJWTDecodedUser,
    payload: {
        priceType: TPriceType;
        price: number;
        voucher?: {
            title: string;
            discountType: string;
            discountValue: number;
            startDate: string;
            endDate: string;
        };
    },
) => {
    // Update the course
    const updatedCourse = await Course.findByIdAndUpdate(
        courseId,
        {
            isPending: false,
            isPublished: true,
            priceType: payload.priceType,
            price: payload.price,
            approvedBy: user.userId,
        },
        { new: true, runValidators: true },
    );

    if (!updatedCourse) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Course not found');
    }

    // Get the teacher ID for notification purpose
    const teacher = await Teacher.findOne({
        user_id: updatedCourse.teacher_id,
    });
    if (!teacher) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Teacher not found');
    }

    // Create voucher if provided
    if (payload.voucher) {
        // Create voucher with course_id
        await Voucher.create({
            title: payload.voucher.title,
            voucherType: 'Specific_Course',
            discountType: payload.voucher.discountType,
            discountValue: payload.voucher.discountValue,
            startDate: new Date(payload.voucher.startDate),
            endDate: new Date(payload.voucher.endDate),
            course_id: courseId,
            isActive: true,
            isExpired: false,
            createdBy: user.userId,
            updatedBy: user.userId,
        });
    }

    // Send notification to the teacher about course approval

    await notificationService.createNotification(user, {
        recipientId: teacher.user_id.toString(),
        type: 'CourseApproved',
        title: 'Course Approved',
        message: `Your course "${updatedCourse.name}" has been approved by an admin.`,
        resourceType: 'Course',
        resourceId: courseId,
        metaData: {
            approvedBy: user.userId,
            approvedAt: new Date().toISOString(),
            priceType: payload.priceType,
            price: payload.price,
            hasVoucher: !!payload.voucher,
        },
    });

    return updatedCourse;
};

// Get Courses Admin end
const getCoursesForAdmins = async (query: Record<string, any>) => {
    const { isPending, isPublished } = query;

    const queryConditions: Record<string, any> = {};

    // Add conditions based on query parameters
    if (isPending !== undefined) {
        queryConditions.isPending = true;
    }

    if (isPublished !== undefined) {
        queryConditions.isPublished = true;
    }

    const courses = await Course.find(queryConditions).sort({ createdAt: -1 });

    // Get total count of documents matching the query
    const totalCount = await Course.countDocuments(queryConditions);

    return { totalCount, courses };
};

export const courseService = {
    createCourse,
    getCoursePreview,
    getPublishedCoursesForStudent,
    getCourseByID,
    getAllCourses,
    updateCourse,
    deleteCourseByID,
    approvedCourse,
    getCourseByTeacherID,
    getCoursesForAdmins,
};

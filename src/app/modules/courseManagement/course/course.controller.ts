import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../utils/catchAsync';
import sendSuccessResponse from '../../../utils/sendSuccessResponse';
import { courseService } from './course.service';
import { courseFilterableFields } from './course.constant';
import pick from '../../../helpers/pick';
import { createTeacherLog } from '../../teacherLog/teacherLog.utils';

// Create Course
const createCourse = catchAsync(async (req: Request, res: Response) => {
    const result = await courseService.createCourse(
        req.user,
        req.body,
        req.file,
    );
    await createTeacherLog(req,result.teacher_id.toString(),"Create_Course",`Created a course with ID ${result._id }`)

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Course created successfully',
        data: result,
    });
});

// Preview Course
const getCoursePreview = catchAsync(async (req: Request, res: Response) => {
    const { courseId } = req.params;

    const result = await courseService.getCoursePreview(courseId);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Course preview retrieved successfully',
        data: result,
    });
});

const getPublishedCoursesForStudent = catchAsync(
    async (req: Request, res: Response) => {
        const user = req.user;
        const filters = pick(req.query, courseFilterableFields);

        const result = await courseService.getPublishedCoursesForStudent(user,filters);

        sendSuccessResponse(res, {
            statusCode: StatusCodes.OK,
            message: 'Courses are retrieved successfully',
            data: result,
        });
    },
);

const getCourseByID = catchAsync(async (req: Request, res: Response) => {
    const { courseId } = req.params;

    const result = await courseService.getCourseByID(courseId);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Course retrieved successfully',
        data: result,
    });
});

const getCourseByTeacherID = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.user;
    const result = await courseService.getCourseByTeacherID(userId, req.query);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Course created by teacher fetched successfully',
        data: result,
    });
});

// Get All Courses
const getAllCourses = catchAsync(async (req: Request, res: Response) => {
    const result = await courseService.getAllCourses();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'All courses retrieved successfully',
        data: result,
    });
});

// Update Course
const updateCourse = catchAsync(async (req: Request, res: Response) => {
    const { courseId } = req.params;

    const result = await courseService.updateCourse(
        courseId,
        req.body,
        req.user,
        req.file,
    );
    if(result){

        await createTeacherLog(req,result.teacher_id.toString(),"Update_Course",`Updated a course with ID ${result._id }`)
    }


    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Course updated successfully',
        data: result,
    });
});

const deleteCourseByID = catchAsync(async (req: Request, res: Response) => {
    const { courseId } = req.params;

    const result = await courseService.deleteCourseByID(courseId);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Course deleted successfully',
        data: result,
    });
});

const approvedCourse = catchAsync(async (req: Request, res: Response) => {
    const { courseId } = req.params;

    const result = await courseService.approvedCourse(
        courseId,
        req.user,
        req.body,
    );

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Course approved successfully',
        data: result,
    });
});

// Get All Courses
const getCoursesForAdmins = catchAsync(async (req: Request, res: Response) => {
    const result = await courseService.getCoursesForAdmins(req.query);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Courses retrieved successfully',
        data: result,
    });
});

export const courseController = {
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

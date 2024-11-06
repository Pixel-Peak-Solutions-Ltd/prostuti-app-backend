import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../utils/catchAsync';
import sendSuccessResponse from '../../../utils/sendSuccessResponse';
import { courseService } from './course.service';

// Create Course
const createCourse = catchAsync(async (req: Request, res: Response) => {
    const result = await courseService.createCourse(
        req.user,
        req.body,
        req.file,
    );

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Course created successfully',
        data: result,
    });
});

const getAllCourses = catchAsync(async (req: Request, res: Response) => {
    const result = await courseService.getAllCourses();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Courses are retrieved successfully',
        data: result,
    });
});

const getCourseByID = catchAsync(async (req: Request, res: Response) => {
    const { courseId } = req.params;

    const result = await courseService.getCourseByID(courseId);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Course retrieved successfully',
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

export const courseController = {
    createCourse,
    getAllCourses,
    getCourseByID,
    updateCourse,
    deleteCourseByID,
};

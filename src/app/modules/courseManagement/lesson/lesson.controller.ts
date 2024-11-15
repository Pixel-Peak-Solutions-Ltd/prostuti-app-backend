import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../utils/catchAsync';
import sendSuccessResponse from '../../../utils/sendSuccessResponse';
import { lessonService } from './lesson.service';

const createLesson = catchAsync(async (req: Request, res: Response) => {
    const result = await lessonService.createLesson(req.body);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Lesson created successfully',
        data: result,
    });
});

const getAllLessons = catchAsync(async (req: Request, res: Response) => {
    const result = await lessonService.getAllLessons();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Lessons retrieved successfully',
        data: result,
    });
});

const getAllLessonsByCourseId = catchAsync(
    async (req: Request, res: Response) => {
        const { courseId } = req.params;

        const result = await lessonService.getAllLessonsByCourseId(courseId);

        sendSuccessResponse(res, {
            statusCode: StatusCodes.OK,
            message: 'All lessons of this course retrieved successfully',
            data: result,
        });
    },
);

const getLessonByID = catchAsync(async (req: Request, res: Response) => {
    const result = await lessonService.getLessonByID();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Lesson retrieved successfully',
        data: result,
    });
});

const updateLesson = catchAsync(async (req: Request, res: Response) => {
    const result = await lessonService.updateLesson();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Lesson updated successfully',
        data: result,
    });
});

const deleteLessonByID = catchAsync(async (req: Request, res: Response) => {
    const result = await lessonService.deleteLessonByID();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Lesson deleted successfully',
        data: result,
    });
});

export const lessonController = {
    createLesson,
    getAllLessons,
    getAllLessonsByCourseId,
    getLessonByID,
    updateLesson,
    deleteLessonByID,
};

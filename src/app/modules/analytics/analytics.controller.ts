import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendSuccessResponse from '../../utils/sendSuccessResponse';
import { analyticsService } from './analytics.service';

const getCourseEngagement = catchAsync(async (req: Request, res: Response) => {
    const result = await analyticsService.getCourseEngagement();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Course engagement data retrieved successfully',
        data: result,
    });
});

const getTopSellingCourses = catchAsync(async (req: Request, res: Response) => {
    const result = await analyticsService.getTopSellingCourses();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Top selling courses data retrieved successfully',
        data: result,
    });
});

const getAssignmentCompletion = catchAsync(
    async (req: Request, res: Response) => {
        const result = await analyticsService.getAssignmentCompletion();

        sendSuccessResponse(res, {
            statusCode: StatusCodes.OK,
            message: 'Assignment completion data retrieved successfully',
            data: result,
        });
    },
);
const getTestCompletion = catchAsync(async (req: Request, res: Response) => {
    const result = await analyticsService.getTestCompletion();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Test completion data retrieved successfully',
        data: result,
    });
});

const getMonthlySalesStats = catchAsync(async (req: Request, res: Response) => {
    const result = await analyticsService.getMonthlySalesStats();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Monthly sales data retrieved successfully',
        data: result,
    });
});

const getLast7DaysSales = catchAsync(async (req: Request, res: Response) => {
    const result = await analyticsService.getLast7DaysSales();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Last 7 days sales data retrieved successfully',
        data: result,
    });
});

const getFlashcardStats = catchAsync(async (req: Request, res: Response) => {
    const result = await analyticsService.getFlashcardStats();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Flashcard stats data retrieved successfully',
        data: result,
    });
});

// Add to exports
export const analyticsController = {
    getCourseEngagement,
    getTopSellingCourses,
    getAssignmentCompletion,
    getTestCompletion,
    getMonthlySalesStats,
    getLast7DaysSales,
    getFlashcardStats,
};

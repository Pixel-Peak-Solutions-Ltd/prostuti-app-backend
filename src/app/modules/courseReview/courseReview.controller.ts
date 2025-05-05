import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import { courseReviewService } from './courseReview.service';
import sendSuccessResponse from '../../utils/sendSuccessResponse';

const createCourseReview = catchAsync(async (req: Request, res: Response) => {
    const result = await courseReviewService.createCourseReview(
        req.user,
        req.body,
    );

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Course Review Created',
        data: result,
    });
});

const getAllReviewsOfACourse = catchAsync(
    async (req: Request, res: Response) => {
        const { courseId } = req.params;

        const result =
            await courseReviewService.getAllReviewsOfACourse(courseId);

        sendSuccessResponse(res, {
            statusCode: StatusCodes.OK,
            message: 'All reviews for this course retrieved successfully',
            data: result,
        });
    },
);

export const courseReviewController = {
    createCourseReview,
    getAllReviewsOfACourse,
};

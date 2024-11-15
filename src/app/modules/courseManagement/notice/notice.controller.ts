import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../utils/catchAsync';
import sendSuccessResponse from '../../../utils/sendSuccessResponse';
import { noticeService } from './notice.service';

const createNotice = catchAsync(async (req: Request, res: Response) => {
    const result = await noticeService.createNotice(req.body);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Notice created successfully',
        data: result,
    });
});

const getAllNoticesByCourseId = catchAsync(
    async (req: Request, res: Response) => {
        const { courseId } = req.params;
        const result = await noticeService.getAllNoticesByCourseId(courseId);

        sendSuccessResponse(res, {
            statusCode: StatusCodes.OK,
            message: 'All notices for this course retrieved successfully',
            data: result,
        });
    },
);

const getAllNotices = catchAsync(async (req: Request, res: Response) => {
    const result = await noticeService.getAllNotices();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Notices retrieved successfully',
        data: result,
    });
});

const getNoticeByID = catchAsync(async (req: Request, res: Response) => {
    const { noticeId } = req.params;

    const result = await noticeService.getNoticeByID(noticeId);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Notice retrieved successfully',
        data: result,
    });
});

const updateNotice = catchAsync(async (req: Request, res: Response) => {
    const { noticeId } = req.params;

    const result = await noticeService.updateNotice(noticeId, req.body);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Notice updated successfully',
        data: result,
    });
});

const deleteNoticeByID = catchAsync(async (req: Request, res: Response) => {
    const { noticeId } = req.params;

    const result = await noticeService.deleteNoticeByID(noticeId);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Notice deleted successfully',
        data: result,
    });
});

export const noticeController = {
    createNotice,
    getAllNoticesByCourseId,
    getAllNotices,
    getNoticeByID,
    updateNotice,
    deleteNoticeByID,
};

import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendSuccessResponse from '../../utils/sendSuccessResponse';
import { studentNotificationService } from './studentNotification.service';

const getStudentNotifications = catchAsync(
    async (req: Request, res: Response) => {
        const result = await studentNotificationService.getStudentNotifications(
            req.user,
            req.query,
        );

        sendSuccessResponse(res, {
            statusCode: StatusCodes.OK,
            message: 'Student Notifications retrieved successfully',
            data: result,
        });
    },
);

const makeReadStudentNotification = catchAsync(
    async (req: Request, res: Response) => {
        const { notificationId } = req.params;
        const { userId } = req.user;

        const result =
            await studentNotificationService.makeReadStudentNotification(
                notificationId,
                userId,
            );

        sendSuccessResponse(res, {
            statusCode: StatusCodes.OK,
            message: 'Updated successfully',
            data: result,
        });
    },
);

// Add to exports
export const studentNotificationController = {
    getStudentNotifications,
    makeReadStudentNotification,
};

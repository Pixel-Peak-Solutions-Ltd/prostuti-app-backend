import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../utils/catchAsync';
import sendSuccessResponse from '../../../utils/sendSuccessResponse';
import { recodedClassService } from './recodedClass.service';

const createRecodedClass = catchAsync(async (req: Request, res: Response) => {
    const result = await recodedClassService.createRecodedClass(
        req.body,
        req.file,
    );

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Recoded class created successfully',
        data: result,
    });
});

const getAllCourseRecodedClassWithLessons = catchAsync(
    async (req: Request, res: Response) => {
        const { courseId } = req.params;

        const result =
            await recodedClassService.getAllCourseRecodedClassWithLessons(
                courseId,
            );

        sendSuccessResponse(res, {
            statusCode: StatusCodes.OK,
            message: 'Retrieve all recorded classes of the course with lessons',
            data: result,
        });
    },
);

const getAllRecodedClass = catchAsync(async (req: Request, res: Response) => {
    const result = await recodedClassService.getAllRecodedClass();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Recoded classes retrieved successfully',
        data: result,
    });
});

const getRecodedClassByID = catchAsync(async (req: Request, res: Response) => {
    const { recodedClassId } = req.params;

    const result =
        await recodedClassService.getRecodedClassByID(recodedClassId);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Recoded class retrieved successfully',
        data: result,
    });
});

const updateRecodedClass = catchAsync(async (req: Request, res: Response) => {
    const { recodedClassId } = req.params;

    const result = await recodedClassService.updateRecodedClass(
        recodedClassId,
        req.body,
    );

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Recoded class updated successfully',
        data: result,
    });
});

// mark as complete status change for record class
const updateRecordClassCompleteStatus = catchAsync(async (req: Request, res: Response) => {
    const { recordedClassId } = req.params;

    const result = await recodedClassService.markAsComplete(recordedClassId);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Recoded class marked as complete',
        data: result,
    });
});

const deleteRecodedClassByID = catchAsync(
    async (req: Request, res: Response) => {
        const { recodedClassId } = req.params;

        const result =
            await recodedClassService.deleteRecodedClassByID(recodedClassId);

        sendSuccessResponse(res, {
            statusCode: StatusCodes.OK,
            message: 'Recoded class deleted successfully',
            data: result,
        });
    },
);

export const recodedClassController = {
    createRecodedClass,
    getAllCourseRecodedClassWithLessons,
    getAllRecodedClass,
    getRecodedClassByID,
    updateRecodedClass,
    deleteRecodedClassByID,
    updateRecordClassCompleteStatus
};

import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../utils/catchAsync';
import sendSuccessResponse from '../../../utils/sendSuccessResponse';
import { recodedClassService } from './recodedClass.service';

const createRecodedClass = catchAsync(async (req: Request, res: Response) => {
    const result = await recodedClassService.createRecodedClass(req.body);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Recoded class created successfully',
        data: result,
    });
});

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
    getAllRecodedClass,
    getRecodedClassByID,
    updateRecodedClass,
    deleteRecodedClassByID,
};

import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../utils/catchAsync';
import sendSuccessResponse from '../../../utils/sendSuccessResponse';
import { resourceService } from './resource.service';
import { Express } from 'express';

const createResource = catchAsync(async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];

    const result = await resourceService.createResource(req.body, files);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Resource created successfully',
        data: result,
    });
});

const getAllCourseResourcesWithLessons = catchAsync(
    async (req: Request, res: Response) => {
        const { courseId } = req.params;

        const result =
            await resourceService.getAllCourseResourcesWithLessons(courseId);

        sendSuccessResponse(res, {
            statusCode: StatusCodes.OK,
            message: 'Resource created successfully',
            data: result,
        });
    },
);

const getAllResource = catchAsync(async (req: Request, res: Response) => {
    const result = await resourceService.getAllResource();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Resources retrieved successfully',
        data: result,
    });
});

const getResourceByID = catchAsync(async (req: Request, res: Response) => {
    const { resourceId } = req.params;

    const result = await resourceService.getResourceByID(resourceId);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Resource retrieved successfully',
        data: result,
    });
});

const updateResource = catchAsync(async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];

    const { resourceId } = req.params;
    const result = await resourceService.updateResource(
        resourceId,
        req.body,
        files,
    );

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Resource updated successfully',
        data: result,
    });
});

const resourceCompletion = catchAsync(async (req: Request, res: Response) => {
    const { resourceId } = req.params;
    const result = await resourceService.markResourceAsCompleted(resourceId);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Resource marked as completed',
        data: result,
    });
})

const deleteResourceByID = catchAsync(async (req: Request, res: Response) => {
    const { resourceId } = req.params;

    const result = await resourceService.deleteResourceByID(resourceId);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Resource deleted successfully',
        data: result,
    });
});

export const resourceController = {
    createResource,
    getAllCourseResourcesWithLessons,
    getAllResource,
    getResourceByID,
    updateResource,
    deleteResourceByID,
    resourceCompletion
};

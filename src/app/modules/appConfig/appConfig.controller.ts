import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendSuccessResponse from '../../utils/sendSuccessResponse';
import { appConfigService } from './appConfig.service';

const getAppConfig = catchAsync(async (req: Request, res: Response) => {
    const result = await appConfigService.getAppConfig();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'App configuration retrieved successfully',
        data: result,
    });
});

const updateAppConfig = catchAsync(async (req: Request, res: Response) => {
    const result = await appConfigService.updateAppConfig(req.body);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'App configuration updated successfully',
        data: result,
    });
});

export const appConfigController = {
    getAppConfig,
    updateAppConfig,
};

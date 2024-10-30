/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import sendSuccessResponse from '../utils/sendSuccessResponse';
import { StatusCodes } from 'http-status-codes';
import i18n from '../i18n';

const healthCheck = (req: Request, res: Response, next: NextFunction) => {
    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: i18n.__('health check'),
    });
};

export default healthCheck;

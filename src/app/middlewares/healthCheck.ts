/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import sendSuccessResponse from '../utils/sendSuccessResponse';
import { StatusCodes } from 'http-status-codes';

const healthCheck = (req: Request, res: Response, next: NextFunction) => {
    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Server is running properly',
    });
};

export default healthCheck;

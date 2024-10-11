/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { StatusCodes } from 'http-status-codes';
import { NextFunction, Request, Response } from 'express';
import sendErrorResponse from '../utils/sendErrorResponse';

const notFound = (req: Request, res: Response, next: NextFunction) => {
    sendErrorResponse(res, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: `Path not found for ${req.originalUrl}`,
    });
};

export default notFound;

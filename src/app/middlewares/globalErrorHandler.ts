/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { IErrorResponse } from './../utils/sendErrorResponse';
import { ErrorRequestHandler } from 'express';
import errorPreprocessor from '../helpers/errorHelpers/errorPreprocessor';
import sendErrorResponse from '../utils/sendErrorResponse';

const globalErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
    // Default Error response object
    let errorResponse: IErrorResponse = {
        statusCode: error.statusCode || 500,
        message: error.message || 'Something went wrong',
        errorSources: [{ path: '', message: 'Something wend wrong' }],
    };

    // Handle all kinds of error
    errorResponse = errorPreprocessor(error);

    // Send Error Response
    sendErrorResponse(res, {
        statusCode: errorResponse.statusCode,
        message: errorResponse.message,
        errorSources: errorResponse.errorSources,
    });
};

export default globalErrorHandler;

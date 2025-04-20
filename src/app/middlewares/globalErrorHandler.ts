/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { IErrorResponse } from './../utils/sendErrorResponse';
import { ErrorRequestHandler } from 'express';
import errorPreprocessor from '../helpers/errorHelpers/errorPreprocessor';
import sendErrorResponse from '../utils/sendErrorResponse';
import { ZodError } from 'zod';
import AppError from '../classes/errorClasses/AppError';
import logger from '../logger/logger';

const globalErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
    // Default Error response object
    let errorResponse: IErrorResponse = {
        statusCode: error.statusCode || 500,
        message: error.message || 'Something went wrong',
        errorSources: [{ path: '', message: 'Something went wrong' }],
    };

     // Determine error type for specific log message
     let errorType: string;
     if (error instanceof ZodError) {
         errorType = 'Zod validation error';
     } else if (error.name === 'ValidationError') {
         errorType = 'Mongoose validation error';
     } else if (error.name === 'CastError') {
         errorType = 'Mongoose cast error';
     } else if (error.code === 11000) {
         errorType = 'Mongoose duplicate key error';
     } else if (error instanceof AppError) {
         errorType = 'Application error';
     } else if (error.name === 'TokenExpiredError') {
         errorType = 'JWT token expired error';
     } else if (error.message?.startsWith('Unexpected token')) {
         errorType = 'JWT unexpected token error';
     } else if (error.name === 'JsonWebTokenError') {
         errorType = 'JWT token error';
     } else {
         errorType = 'Unknown error';
     }
 

    // Handle all kinds of error
    errorResponse = errorPreprocessor(error);

    // Log the error with specific error type
    logger.error(`${errorType}: ${errorResponse.message}`, {
        statusCode: errorResponse.statusCode,
        errorSources: errorResponse.errorSources,
        stack: error.stack , 
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userId: req.user?.userId || 'unauthenticated',
        role:req.user?.role|| "unauthenticated"
    });

    // Send Error Response
    sendErrorResponse(res, {
        statusCode: errorResponse.statusCode,
        message: errorResponse.message,
        errorSources: errorResponse.errorSources,
    });
};

export default globalErrorHandler;

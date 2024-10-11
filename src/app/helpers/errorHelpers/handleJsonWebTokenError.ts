/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes';
import { IErrorResponse, TErrorSources } from '../../utils/sendErrorResponse';

const handleJsonWebTokenError = (error: any): IErrorResponse => {
    const errorSources: TErrorSources = [
        {
            path: '',
            message: error.message,
        },
    ];
    return {
        statusCode: StatusCodes.UNAUTHORIZED,
        message: 'Invalid Token. Please login again',
        errorSources,
    };
};

export default handleJsonWebTokenError;

/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes';
import { IErrorResponse, TErrorSources } from '../../utils/sendErrorResponse';

const handleJWTExpiredError = (error: any): IErrorResponse => {
    const errorSources: TErrorSources = [
        {
            path: '',
            message: error.message,
        },
    ];
    return {
        statusCode: StatusCodes.UNAUTHORIZED,
        message: 'Your token is expired. Please login again',
        errorSources,
    };
};

export default handleJWTExpiredError;

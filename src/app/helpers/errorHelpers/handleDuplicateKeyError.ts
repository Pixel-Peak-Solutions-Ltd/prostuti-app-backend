/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes';
import { IErrorResponse, TErrorSources } from '../../utils/sendErrorResponse';

const handleDuplicateKeyError = (error: any): IErrorResponse => {
    const errorSources: TErrorSources = [
        {
            path: Object.keys(error.keyPattern)[0],
            message: `Duplicate field value ${error.message.match(
                /(["'])(?:(?=(\\?))\2.)*?\1/g,
            )}. Please use another value!`,
        },
    ];
    return {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Validation error',
        errorSources,
    };
};

export default handleDuplicateKeyError;

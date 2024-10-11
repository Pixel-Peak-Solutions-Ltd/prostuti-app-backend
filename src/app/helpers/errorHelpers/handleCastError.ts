import mongoose from 'mongoose';
import { IErrorResponse, TErrorSources } from '../../utils/sendErrorResponse';
import { StatusCodes } from 'http-status-codes';

const handleCastError = (error: mongoose.Error.CastError): IErrorResponse => {
    const errorSources: TErrorSources = [
        { path: error.path, message: `Invalid ${error.path}: ${error.value}` },
    ];
    return {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Invalid ID',
        errorSources,
    };
};

export default handleCastError;

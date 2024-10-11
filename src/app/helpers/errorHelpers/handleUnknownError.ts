import { StatusCodes } from 'http-status-codes';
import AppError from '../../classes/errorClasses/AppError';
import { IErrorResponse, TErrorSources } from '../../utils/sendErrorResponse';

const handleUnknownError = (error: AppError): IErrorResponse => {
    const errorSources: TErrorSources = [{ path: '', message: error.message }];

    return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Unknown Error',
        errorSources,
    };
};

export default handleUnknownError;

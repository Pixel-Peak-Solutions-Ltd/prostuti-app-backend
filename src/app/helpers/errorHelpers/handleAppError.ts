import AppError from '../../classes/errorClasses/AppError';
import { IErrorResponse, TErrorSources } from '../../utils/sendErrorResponse';

const handleAppError = (error: AppError): IErrorResponse => {
    const errorSources: TErrorSources = [{ path: '', message: error.message }];

    return {
        statusCode: error.statusCode,
        message: error.message,
        errorSources,
    };
};

export default handleAppError;

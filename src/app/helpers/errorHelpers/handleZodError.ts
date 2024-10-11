import { ZodError, ZodIssue } from 'zod';
import { IErrorResponse, TErrorSources } from '../../utils/sendErrorResponse';
import { StatusCodes } from 'http-status-codes';

const handleZodError = (error: ZodError): IErrorResponse => {
    const errorSources: TErrorSources = error.issues.map((issue: ZodIssue) => ({
        path: issue?.path.at(-1) || '',
        message: issue.message,
    }));
    return {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Validation error',
        errorSources,
    };
};

export default handleZodError;

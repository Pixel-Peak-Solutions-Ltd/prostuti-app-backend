import mongoose from 'mongoose';
import { IErrorResponse, TErrorSources } from '../../utils/sendErrorResponse';
import { StatusCodes } from 'http-status-codes';

const handleValidationError = (
    error: mongoose.Error.ValidationError,
): IErrorResponse => {
    // Get all cast errors
    const castErrors = Object.values(error.errors).filter(
        (val) => val.name === 'CastError',
    );

    // Get all validation errors
    const validatorError = Object.values(error.errors).filter(
        (val) => val.name === 'ValidatorError',
    );

    // Create cast error source
    const castErrorsSources: TErrorSources = castErrors.map((val) => {
        return {
            path: val.path,
            message: val.path,
        };
    });

    // Create validation error sources
    const validatorErrorSource: TErrorSources = validatorError.map((val) => {
        return {
            path: val.path,
            message: val.message,
        };
    });

    return {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Validation error',
        errorSources: [...castErrorsSources, ...validatorErrorSource],
    };
};

export default handleValidationError;

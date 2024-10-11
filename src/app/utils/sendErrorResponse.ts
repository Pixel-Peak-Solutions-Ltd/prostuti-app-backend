import { Response } from 'express';

export type TErrorSources = { path: string | number; message: string }[];

export interface IErrorResponse {
    statusCode: number;
    message: string;
    errorSources?: TErrorSources;
}

const sendErrorResponse = (res: Response, data: IErrorResponse) => {
    res.status(data.statusCode).json({
        success: false,
        message: data.message,
        errorSources: data.errorSources,
    });
};

export default sendErrorResponse;

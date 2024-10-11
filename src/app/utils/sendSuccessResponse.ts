import { Response } from 'express';

interface IMeta {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
}

interface IResponse<T> {
    statusCode: number;
    message?: string;
    meta?: IMeta | undefined;
    data?: T | T[] | null;
}

const sendSuccessResponse = <T>(res: Response, data: IResponse<T>) => {
    return res.status(data.statusCode).json({
        success: true,
        message: data.message,
        meta: data.meta,
        data: data.data,
    });
};

export default sendSuccessResponse;

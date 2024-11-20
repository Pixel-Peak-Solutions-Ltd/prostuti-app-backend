import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { paginationFields } from '../../../constant';
import pick from '../../../helpers/pick';
import { TJWTDecodedUser } from '../../../interfaces/jwt/jwt.type';
import catchAsync from '../../../utils/catchAsync';
import sendSuccessResponse from '../../../utils/sendSuccessResponse';
import { TestFilterableFields } from './test.constant';
import { TestService } from './test.service';


const createTest = catchAsync(async (req: Request, res: Response) => {
    const result = await TestService.createTest(req.user as TJWTDecodedUser,req.body);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Test created successfully',
        data: result,
    });
});

const getAllTests = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, TestFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);
    const result = await TestService.getAllTests(filters,
        paginationOptions,
        req.user as TJWTDecodedUser);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Tests are retrieved successfully',
        data: result,
    });
});

const getTestByID = catchAsync(async (req: Request, res: Response) => {
    const result = await TestService.getTestByID(req.params.id);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Single Test retrieved successfully',
        data: result,
    });
});

const updateTest = catchAsync(async (req: Request, res: Response) => {
    const result = await TestService.updateTest();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Test is updated successfully',
        data: result,
    });
});

const deleteTestByID = catchAsync(async (req: Request, res: Response) => {
    const result = await TestService.deleteTestByID(req.params.id,req.user as TJWTDecodedUser);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Test is deleted successfully',
        data: result,
    });
});

export const TestController = {
    createTest,
    getAllTests,
    getTestByID,
    updateTest,
    deleteTestByID,
};

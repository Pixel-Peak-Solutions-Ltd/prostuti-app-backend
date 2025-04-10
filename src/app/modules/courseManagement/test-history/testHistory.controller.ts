import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { paginationFields } from '../../../constant';
import pick from '../../../helpers/pick';
import { TJWTDecodedUser } from '../../../interfaces/jwt/jwt.type';
import catchAsync from '../../../utils/catchAsync';
import sendSuccessResponse from '../../../utils/sendSuccessResponse';
import { TestHistoryService } from './testHistory.service';
import { TestHistoryFilterableFields } from './testHistory.constant';



const createTestHistory = catchAsync(async (req: Request, res: Response) => {
    const result = await TestHistoryService.createTestHistory(req.user as TJWTDecodedUser,req.body);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'TestHistory submitted successfully',
        data: result,
    });
});


const createWrittenTestHistory = catchAsync(async (req: Request, res: Response) => {
    const result = await TestHistoryService.createWrittenTestHistory(req.user as TJWTDecodedUser,req.body);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'TestHistory submitted successfully',
        data: result,
    });
});


const previewWrittenTestHistory = catchAsync(async (req: Request, res: Response) => {
    const result = await TestHistoryService.previewWrittenTestHistory(req.user as TJWTDecodedUser,req.body);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'TestHistory checked successfully',
        data: result,
    });
});

const getAllTestHistories = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, TestHistoryFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);
    const result = await TestHistoryService.getAllTestHistories(filters,
        paginationOptions,
        req.user as TJWTDecodedUser);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'TestHistorys are retrieved successfully',
        data: result,
    });
});

const getTestHistoryByID = catchAsync(async (req: Request, res: Response) => {
    const result = await TestHistoryService.getTestHistoryByID(req.params.id,req.user as TJWTDecodedUser,);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Single TestHistory retrieved successfully',
        data: result,
    });
});

// const updateTestHistory = catchAsync(async (req: Request, res: Response) => {
//     const result = await TestHistoryService.updateTestHistory();

//     sendSuccessResponse(res, {
//         statusCode: StatusCodes.OK,
//         message: 'TestHistory is updated successfully',
//         data: result,
//     });
// });

// const deleteTestHistoryByID = catchAsync(async (req: Request, res: Response) => {
//     const result = await TestHistoryService.deleteTestHistoryByID(req.params.id,req.user as TJWTDecodedUser);

//     sendSuccessResponse(res, {
//         statusCode: StatusCodes.OK,
//         message: 'TestHistory is deleted successfully',
//         data: result,
//     });
// });

export const TestHistoryController = {
    createTestHistory,createWrittenTestHistory,previewWrittenTestHistory,getTestHistoryByID,getAllTestHistories
};

import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendSuccessResponse from '../../utils/sendSuccessResponse';
import { QuestionPatternService } from './questionPattern.service';
import { questionPatternFilterableFields } from './questionPattern.constant';
import pick from '../../helpers/pick';
import { paginationFields } from '../../constant';



const createQuestionPattern = catchAsync(async (req: Request, res: Response) => {
    const result = await QuestionPatternService.createQuestionPattern(req.user, req.body);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'QuestionPattern created successfully',
        data: result,
    });
});

const getAllQuestionPatterns = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, questionPatternFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);
    const result = await QuestionPatternService.getAllQuestionPatterns(filters, paginationOptions,req.user);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'QuestionPatterns are retrieved successfully',
        data: result,
    });
});

const getQuestionPatternByID = catchAsync(async (req: Request, res: Response) => {
    const result = await QuestionPatternService.getQuestionPatternByID(req.params.id);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Single QuestionPattern retrieved successfully',
        data: result,
    });
});

const updateQuestionPattern = catchAsync(async (req: Request, res: Response) => {
    const result = await QuestionPatternService.updateQuestionPattern();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'QuestionPattern is updated successfully',
        data: result,
    });
});

const deleteQuestionPatternByID = catchAsync(async (req: Request, res: Response) => {
    const result = await QuestionPatternService.deleteQuestionPatternByID(req.params.id,req.user);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'QuestionPattern is deleted successfully',
        data: result,
    });
});

export const QuestionPatternController = {
    createQuestionPattern,
    getAllQuestionPatterns,
    getQuestionPatternByID,
    updateQuestionPattern,
    deleteQuestionPatternByID,
};

import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendSuccessResponse from '../../utils/sendSuccessResponse';
import { QuestionService } from './question.service';



const createQuestion = catchAsync(async (req: Request, res: Response) => {
    const result = await QuestionService.createQuestion();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Question created successfully',
        data: result,
    });
});

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
    const result = await QuestionService.getAllCategories();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Categories are retrieved successfully',
        data: result,
    });
});

const getQuestionByID = catchAsync(async (req: Request, res: Response) => {
    const result = await QuestionService.getQuestionByID();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Single Question retrieved successfully',
        data: result,
    });
});

const updateQuestion = catchAsync(async (req: Request, res: Response) => {
    const result = await QuestionService.updateQuestion();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Question is updated successfully',
        data: result,
    });
});

const deleteQuestionByID = catchAsync(async (req: Request, res: Response) => {
    const result = await QuestionService.deleteQuestionByID();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Question is deleted successfully',
        data: result,
    });
});

export const QuestionController = {
    createQuestion,
    getAllCategories,
    getQuestionByID,
    updateQuestion,
    deleteQuestionByID,
};

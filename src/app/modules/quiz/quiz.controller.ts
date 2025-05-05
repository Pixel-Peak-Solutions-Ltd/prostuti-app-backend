import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendSuccessResponse from "../../utils/sendSuccessResponse";
import { StatusCodes } from "http-status-codes";
import { QuizService } from "./quiz.service";
import pick from "../../helpers/pick";
import { quizFilterableFields } from "./quiz.constant";
import { paginationFields } from "../../constant";

const createMockQuiz = catchAsync(async (req: Request, res: Response) => {
    const result = await QuizService.createMockQuiz(req.user, req.body);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Mock Quiz created successfully',
        data: result,
    });
});

const submitMockQuiz = catchAsync(async (req: Request, res: Response) => {
    const result = await QuizService.submitMockQuiz(req.user, req.body,req.params.id);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Mock Quiz submitted successfully',
        data: result,
    });
});

const createQuizzerQuiz = catchAsync(async (req: Request, res: Response) => {
    const result = await QuizService.createQuizzerQuiz(req.user, req.body);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Quizzer Quiz created successfully',
        data: result,
    });
});

const submitQuizzerQuiz = catchAsync(async (req: Request, res: Response) => {
    const result = await QuizService.submitQuizzerQuiz(req.user, req.body,req.params.id);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Quizzer Quiz submitted successfully',
        data: result,
    });
});

const createSegmentQuiz = catchAsync(async (req: Request, res: Response) => {
    const result = await QuizService.createSegmentQuiz(req.user, req.body);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Segment Quiz created successfully',
        data: result,
    });

});

const submitSegmentQuiz = catchAsync(async (req: Request, res: Response) => {
    const result = await QuizService.submitSegmentQuiz(req.user, req.body,req.params.id);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Segment Quiz submitted successfully',
        data: result,
    });
});

const getAllQuizzes = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, quizFilterableFields);
  const paginationOptions = pick(req.query, paginationFields);
    const result = await QuizService.getAllQuizzes(filters, paginationOptions);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'All quizzes retrieved successfully',
        data: result,
    });
});

const getSingleQuiz= catchAsync(async (req: Request, res: Response) => {
    const result = await QuizService.getSingleQuiz(req.params.id,req.user);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Single quiz retrieved successfully',
        data: result,
    });
});


export const QuizController= {createMockQuiz,submitMockQuiz,createQuizzerQuiz,submitQuizzerQuiz,createSegmentQuiz,submitSegmentQuiz, getAllQuizzes,getSingleQuiz}
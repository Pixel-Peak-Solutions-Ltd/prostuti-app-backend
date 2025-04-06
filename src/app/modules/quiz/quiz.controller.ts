import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendSuccessResponse from "../../utils/sendSuccessResponse";
import { StatusCodes } from "http-status-codes";
import { QuizService } from "./quiz.service";

const createQuiz = catchAsync(async (req: Request, res: Response) => {
    const result = await QuizService.createQuiz(req.user, req.body);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Quiz created successfully',
        data: result,
    });
});
export const QuizController= {createQuiz}
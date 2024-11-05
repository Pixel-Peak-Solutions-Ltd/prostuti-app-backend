import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendSuccessResponse from "../../utils/sendSuccessResponse";
import { favouriteQuestionService } from "./favouriteQuestion.service";
import { Types } from 'mongoose';

const createFavouriteQuestion = catchAsync(async (req, res) => {
    const { userId } = req.user;
    // new Types.ObjectId(userId)
    const studentId = new Types.ObjectId(userId);

    // Convert question strings to ObjectIds if they aren't already
    const questionId = new Types.ObjectId(req.body.favourite_questions);

    const payload = {
        student_id: studentId,
        favourite_questions: [questionId]
    }

    const result = await favouriteQuestionService.createFavouriteQuestionToDB(payload);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Question marked as favourite sucessfully',
        data: result
    })
})

const getFavouriteQuestions = catchAsync(async (req, res) => {
    const { userId } = req.user;

    const result = await favouriteQuestionService.getFavouriteQuestionsFromDB(userId);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Favourite questions retrieved successfully',
        data: result
    })
});

const deleteFavouriteQuestions = catchAsync(async (req, res) => {
    const { userId } = req.user;
    const payload = {
        student_id: userId,
        question_id: req.params.question_id
    }
    const result = await favouriteQuestionService.deleteFavouriteQuestionsFromDB(payload);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Favourite removed successfully',
        data: result
    })
})

export const favouriteQuestionController = {
    createFavouriteQuestion,
    getFavouriteQuestions,
    deleteFavouriteQuestions
}
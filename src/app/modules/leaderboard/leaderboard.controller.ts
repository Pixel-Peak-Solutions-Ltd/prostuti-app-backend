import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendSuccessResponse from '../../utils/sendSuccessResponse';
import { LeaderBoardService } from './leaderboard.service';



const createLeaderBoard = catchAsync(async (req: Request, res: Response) => {
    const result = await LeaderBoardService.createLeaderBoard();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'LeaderBoard created successfully',
        data: result,
    });
});

const getAllLeaderBoards = catchAsync(async (req: Request, res: Response) => {
    const result = await LeaderBoardService.getAllLeaderBoards();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'LeaderBoards are retrieved successfully',
        data: result,
    });
});

const getLeaderBoardByID = catchAsync(async (req: Request, res: Response) => {
    const result = await LeaderBoardService.getLeaderBoardByID();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Single LeaderBoard retrieved successfully',
        data: result,
    });
});

const updateLeaderBoard = catchAsync(async (req: Request, res: Response) => {
    const result = await LeaderBoardService.updateLeaderBoard();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'LeaderBoard is updated successfully',
        data: result,
    });
});

const deleteLeaderBoardByID = catchAsync(async (req: Request, res: Response) => {
    const result = await LeaderBoardService.deleteLeaderBoardByID();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'LeaderBoard is deleted successfully',
        data: result,
    });
});

export const LeaderBoardController = {
    createLeaderBoard,
    getAllLeaderBoards,
    getLeaderBoardByID,
    updateLeaderBoard,
    deleteLeaderBoardByID,
};

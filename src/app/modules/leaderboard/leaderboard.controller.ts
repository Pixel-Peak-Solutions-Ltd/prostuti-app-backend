import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendSuccessResponse from '../../utils/sendSuccessResponse';
import { LeaderBoardService } from './leaderboard.service';
import pick from '../../helpers/pick';
import { leaderBoardFilterableFields } from './leaderboard.constant';
import { paginationFields } from '../../constant';

const getGlobalLeaderBoard = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, leaderBoardFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);
    const result = await LeaderBoardService.getGlobalLeaderBoard(
        filters,
        paginationOptions,
    );

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Global LeaderBoards are retrieved successfully',
        data: result,
    });
});

const getCourseLeaderBoard = catchAsync(async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const filters = pick(req.query, leaderBoardFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);
    const result = await LeaderBoardService.getCourseLeaderBoard(
        courseId,
        filters,
        paginationOptions,
    );

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Course LeaderBoards are retrieved successfully',
        data: result,
    });
});

const getStudentAllAssignmentTestOfACourse = catchAsync(
    async (req: Request, res: Response) => {
        const { courseId, studentId } = req.params;

        const result =
            await LeaderBoardService.getStudentAllAssignmentTestOfACourse(
                courseId,
                studentId,
            );

        sendSuccessResponse(res, {
            statusCode: StatusCodes.OK,
            message:
                'Student’s assignment submissions and test results retrieved successfully',
            data: result,
        });
    },
);

export const LeaderBoardController = {
    getGlobalLeaderBoard,
    getCourseLeaderBoard,
    getStudentAllAssignmentTestOfACourse,
};

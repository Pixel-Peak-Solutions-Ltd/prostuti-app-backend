import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendSuccessResponse from '../../utils/sendSuccessResponse';
import { assignmentSubmissionService } from './assignmentSubmission.service';

const submitAssignment = catchAsync(async (req: Request, res: Response) => {
    const result = await assignmentSubmissionService.submitAssignment(
        req.user,
        req.body,
        req.file,
    );

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Assignment submitted successfully',
        data: result,
    });
});

const getSubmittedAssignmentList = catchAsync(
    async (req: Request, res: Response) => {
        const { courseId, assignmentId } = req.params;

        const result =
            await assignmentSubmissionService.getSubmittedAssignmentList(
                courseId,
                assignmentId,
            );

        sendSuccessResponse(res, {
            statusCode: StatusCodes.OK,
            message: 'Assignment submitted list retrieved successfully',
            data: result,
        });
    },
);

const getASubmittedAssignment = catchAsync(
    async (req: Request, res: Response) => {
        const { assignmentSubmittedId } = req.params;

        const result =
            await assignmentSubmissionService.getASubmittedAssignment(
                assignmentSubmittedId,
            );

        sendSuccessResponse(res, {
            statusCode: StatusCodes.OK,
            message: 'Submitted assignment retrieved successfully',
            data: result,
        });
    },
);

const giveAssignmentMark = catchAsync(async (req: Request, res: Response) => {
    const { givenMark } = req.body;
    const { assignmentSubmittedId } = req.params;

    const result = await assignmentSubmissionService.giveAssignmentMark(
        givenMark,
        assignmentSubmittedId,
    );

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Mark added for this assignment successfully',
        data: result,
    });
});

export const assignmentSubmissionController = {
    submitAssignment,
    getSubmittedAssignmentList,
    getASubmittedAssignment,
    giveAssignmentMark,
};

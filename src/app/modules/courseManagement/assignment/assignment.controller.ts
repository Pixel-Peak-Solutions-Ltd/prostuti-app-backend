import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../utils/catchAsync';
import sendSuccessResponse from '../../../utils/sendSuccessResponse';
import { assignmentService } from './assignment.service';
import { Express } from 'express';

const createAssignment = catchAsync(async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];

    const result = await assignmentService.createAssignment(req.body, files);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Assignment created successfully',
        data: result,
    });
});

const getAllCourseAssignmentsWithLessons = catchAsync(
    async (req: Request, res: Response) => {
        const { courseId } = req.params;
        const result =
            await assignmentService.getAllCourseAssignmentsWithLessons(
                courseId,
            );

        sendSuccessResponse(res, {
            statusCode: StatusCodes.OK,
            message: 'Retrieve all assignments of the course with lessons',
            data: result,
        });
    },
);

const getAllAssignments = catchAsync(async (req: Request, res: Response) => {
    const result = await assignmentService.getAllAssignments();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Assignments retrieved successfully',
        data: result,
    });
});

const getAssignmentByID = catchAsync(async (req: Request, res: Response) => {
    const { assignmentId } = req.params;

    const result = await assignmentService.getAssignmentByID(assignmentId);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Assignment retrieved successfully',
        data: result,
    });
});

const updateAssignment = catchAsync(async (req: Request, res: Response) => {
    const { assignmentId } = req.params;
    const files = req.files as Express.Multer.File[];

    const result = await assignmentService.updateAssignment(
        assignmentId,
        req.body,
        files,
    );

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Assignment updated successfully',
        data: result,
    });
});

const deleteAssignmentByID = catchAsync(async (req: Request, res: Response) => {
    const { assignmentId } = req.params;
    const result = await assignmentService.deleteAssignmentByID(assignmentId);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Assignment deleted successfully',
        data: result,
    });
});

export const assignmentController = {
    createAssignment,
    getAllCourseAssignmentsWithLessons,
    getAllAssignments,
    getAssignmentByID,
    updateAssignment,
    deleteAssignmentByID,
};

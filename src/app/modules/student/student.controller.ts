import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendSuccessResponse from '../../utils/sendSuccessResponse';
import { studentService } from './student.service';

const createStudents = catchAsync(async (req: Request, res: Response) => {
    const result = await studentService.createStudent();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Students created successfully',
        data: result,
    });
});

const getAllStudents = catchAsync(async (req: Request, res: Response) => {
    const result = await studentService.getAllStudents();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Students are retrieved successfully',
        data: result,
    });
});

const getStudentByID = catchAsync(async (req: Request, res: Response) => {
    const result = await studentService.getStudentByID();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Student retrieved successfully',
        data: result,
    });
});

const updateStudent = catchAsync(async (req: Request, res: Response) => {
    const { studentId } = req.params;

    const result = await studentService.updateStudent(
        studentId,
        req.body,
        req.user,
        req.file,
    );

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Student profile updated successfully',
        data: result,
    });
});

const deleteUserByID = catchAsync(async (req: Request, res: Response) => {
    const result = await studentService.deleteUserByID();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Students deleted successfully',
        data: result,
    });
});

export const studentController = {
    createStudents,
    getAllStudents,
    getStudentByID,
    updateStudent,
    deleteUserByID,
};

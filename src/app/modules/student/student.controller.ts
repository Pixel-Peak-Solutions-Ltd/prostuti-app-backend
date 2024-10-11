import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendSuccessResponse from '../../utils/sendSuccessResponse';
import { studentServices } from './student.service';

const createStudents = catchAsync(async (req, res) => {
    const result = await studentServices.createStudent();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Students created successfully',
        data: result,
    });
});

const getAllStudents = catchAsync(async (req, res) => {
    const result = await studentServices.getAllStudents();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Students are retrieved successfully',
        data: result,
    });
});

const getStudentByID = catchAsync(async (req, res) => {
    const result = await studentServices.getStudentByID();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Student retrieved successfully',
        data: result,
    });
});

const updateStudent = catchAsync(async (req, res) => {
    const result = await studentServices.updateStudent();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Student is updated successfully',
        data: result,
    });
});

const deleteUserByID = catchAsync(async (req, res) => {
    const result = await studentServices.deleteUserByID();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Students deleted successfully',
        data: result,
    });
});

export const studentControllers = {
    createStudents,
    getAllStudents,
    getStudentByID,
    updateStudent,
    deleteUserByID,
};

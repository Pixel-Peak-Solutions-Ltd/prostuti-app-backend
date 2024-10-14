import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';

import sendSuccessResponse from '../../utils/sendSuccessResponse';
import { userService } from './user.service';

const createStudent = catchAsync(async (req, res) => {
    const result = await userService.createStudent();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Student is created successfully',
        data: result,
    });
});

const createTeacher = catchAsync(async (req, res) => {
    const result = await userService.createTeacher();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Faculty is created successfully',
        data: result,
    });
});

const createAdmin = catchAsync(async (req, res) => {
    const result = await userService.createAdmin();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Admin is created successfully',
        data: result,
    });
});

export const userController = {
    createStudent,
    createTeacher,
    createAdmin,
};

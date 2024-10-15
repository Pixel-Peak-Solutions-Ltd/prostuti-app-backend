import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendSuccessResponse from '../../utils/sendSuccessResponse';
import { authService } from './auth.service';

const registerStudent = catchAsync(async (req, res) => {
    const { phone, password } = req.body;

    const result = await authService.registerStudent(phone, password);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Students registered successfully',
        data: result,
    });
});

// Login User (student, teacher and admin)
const loginUser = catchAsync(async (req, res) => {
    const result = await authService.loginUser(req.body);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'User login successfully',
        data: result,
    });
});

export const authController = {
    registerStudent,
    loginUser,
};

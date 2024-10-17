import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendSuccessResponse from '../../utils/sendSuccessResponse';
import { authService } from './auth.service';

const registerStudent = catchAsync(async (req, res) => {
    const { name, email, phone, password } = req.body;

    const result = await authService.registerStudent(
        name,
        email,
        phone,
        password,
    );

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

// Get refresh token
const refreshToken = catchAsync(async (req, res) => {
    const { refreshToken } = req.body;

    const result = await authService.refreshToken(refreshToken);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Access token is retrieved successfully!',
        data: result,
    });
});

export const authController = {
    registerStudent,
    loginUser,
    refreshToken,
};

import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendSuccessResponse from '../../utils/sendSuccessResponse';
import { phonVerificationService } from './phoneVerification.service';

const sendVerificationCode = catchAsync(async (req, res) => {
    const { phoneNumber } = req.body;

    const result =
        await phonVerificationService.sendVerificationCode(phoneNumber);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'OTP sent successfully',
        data: result,
    });
});

const verifyPhoneNumber = catchAsync(async (req, res) => {
    const { phoneNumber, code } = req.body;

    const result = await phonVerificationService.verifyPhoneNumber(
        phoneNumber,
        code,
    );

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Phone number verified',
        data: result,
    });
});

export const phonVerificationController = {
    sendVerificationCode,
    verifyPhoneNumber,
};

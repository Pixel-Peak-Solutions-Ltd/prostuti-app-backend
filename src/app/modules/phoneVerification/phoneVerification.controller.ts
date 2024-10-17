import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendSuccessResponse from '../../utils/sendSuccessResponse';
import { phonVerificationService } from './phoneVerification.service';

const sendVerificationCode = catchAsync(async (req, res) => {
    const { phoneNumber, phoneVerificationType } = req.body;

    const result = await phonVerificationService.sendVerificationCode(
        phoneNumber,
        phoneVerificationType,
    );

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'OTP sent successfully',
        data: result,
    });
});

const verifyPhoneNumber = catchAsync(async (req, res) => {
    const { phoneNumber, code, phoneVerificationType } = req.body;

    const result = await phonVerificationService.verifyPhoneNumber(
        phoneNumber,
        code,
        phoneVerificationType,
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

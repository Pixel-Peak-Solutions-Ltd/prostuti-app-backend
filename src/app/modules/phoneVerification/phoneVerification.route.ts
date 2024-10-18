import express from 'express';
import { phonVerificationController } from './phoneVerification.controller';
import validateRequest from '../../middlewares/validateRequest';
import { phoneVerificationValidator } from './phoneVerification.validation';

const router = express.Router();

router
    .post(
        '/send-verification-code',
        validateRequest(
            phoneVerificationValidator.sendVerificationCodeValidationSchema,
        ),
        phonVerificationController.sendVerificationCode,
    )
    .post(
        '/verify-phone-number',
        validateRequest(phoneVerificationValidator.verifyPhoneValidationSchema),
        phonVerificationController.verifyPhoneNumber,
    );

export const phonVerificationRoute = router;

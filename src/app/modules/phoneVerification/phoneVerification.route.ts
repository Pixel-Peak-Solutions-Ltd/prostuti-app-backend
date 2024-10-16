import express from 'express';
import { phonVerificationController } from './phoneVerification.controller';

const router = express.Router();

router
    .post(
        '/send-verification-code',
        phonVerificationController.sendVerificationCode,
    )
    .post('/verify-phone-number', phonVerificationController.verifyPhoneNumber);

export const phonVerificationRoute = router;

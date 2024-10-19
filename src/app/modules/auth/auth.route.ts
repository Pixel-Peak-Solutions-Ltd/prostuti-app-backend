import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { authController } from './auth.controller';
import { authValidator } from './auth.validation';

const router = express.Router();

router
    .post(
        '/register-student',
        validateRequest(authValidator.registerStudentValidationSchema),
        authController.registerStudent,
    )
    .post(
        '/login',
        validateRequest(authValidator.loginUserSchema),
        authController.loginUser,
    )
    .post(
        '/refresh-token',
        validateRequest(authValidator.teacherAdminRefreshTokenValidationSchema),
        authController.getTeacherAdminRefreshToken,
    )
    .post(
        '/student/refresh-token',
        validateRequest(authValidator.studentRefreshTokenValidationSchema),
        authController.getStudentRefreshToken,
    )
    .post(
        '/student/reset-password',
        validateRequest(authValidator.studentResetPasswordValidationSchema),
        authController.resetStudentPassword,
    );

export const authRoute = router;

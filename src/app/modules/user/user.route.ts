import express from 'express';
import { userController } from './user.controller';
import validateRequest from '../../middlewares/validateRequest';
import { userValidator } from './user.validation';

const router = express.Router();

router
    .post(
        '/create-teacher',
        validateRequest(userValidator.createTeacherAdminValidationSchema),
        userController.createTeacher,
    )
    .post(
        '/create-admin',
        validateRequest(userValidator.createTeacherAdminValidationSchema),
        userController.createAdmin,
    );

export const userRoute = router;

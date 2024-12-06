import express from 'express';
import { userController } from './user.controller';
import validateRequest from '../../middlewares/validateRequest';
import { userValidator } from './user.validation';
import auth from '../../middlewares/auth';

const router = express.Router();

router
    .get('/profile', auth(), userController.profile)
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

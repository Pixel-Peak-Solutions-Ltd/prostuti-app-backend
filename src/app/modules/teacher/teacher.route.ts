import express from 'express';
import auth from '../../middlewares/auth';
import { teacherController } from './teacher.controller';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { teacherValidator } from './teacher.validation';

const router = express.Router();

router.patch(
    '/profile/:teacherId',
    auth(USER_ROLE.teacher),
    validateRequest(teacherValidator.updateTeacherValidationSchema),
    teacherController.updateTeacher,
);

export const teacherRoute = router;

import express from 'express';
import auth from '../../middlewares/auth';
import { teacherController } from './teacher.controller';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { teacherValidator } from './teacher.validation';
import { upload } from '../../middlewares/multerConfig';
import uploadB2 from '../../middlewares/backBlaze';

const router = express.Router();

router.patch(
    '/profile/:teacherId',
    auth(USER_ROLE.teacher),
    validateRequest(teacherValidator.updateTeacherValidationSchema),
    upload.single('avatar'),
    uploadB2,
    teacherController.updateTeacher,
);


export const teacherRoute = router;

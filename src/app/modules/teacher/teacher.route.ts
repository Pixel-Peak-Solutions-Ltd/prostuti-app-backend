import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';
import { upload } from '../../middlewares/multerConfig';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../user/user.constant';
import { teacherController } from './teacher.controller';
import { teacherValidator } from './teacher.validation';

const router = express.Router();

router.patch(
    '/profile/:teacherId',
    auth(USER_ROLE.teacher),
    upload.single('avatar'),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = JSON.parse(req.body.profileData);
        next();
    },
    validateRequest(teacherValidator.updateTeacherValidationSchema),
    teacherController.updateTeacher,
);

export const teacherRoute = router;

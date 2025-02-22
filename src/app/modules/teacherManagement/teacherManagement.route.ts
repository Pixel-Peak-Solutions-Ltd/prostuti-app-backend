import express from 'express';
import { teacherManagementController } from './teacherManagement.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';

const router = express.Router();

router
    .get('/', auth(USER_ROLE.admin), teacherManagementController.getAllTeacher)
    .get(
        '/:teacherId',
        auth(USER_ROLE.admin),
        teacherManagementController.getTeacherInformation,
    );

export const teacherManagementRoute = router;

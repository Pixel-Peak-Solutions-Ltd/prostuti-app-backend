import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import { adminController } from './admin.controller';

const router = express.Router();

router.post('/deleteCourse/:courseId', auth(USER_ROLE.admin), adminController.deleteCourse);
router.post('/deleteStudent/:userId', auth(USER_ROLE.admin), adminController.deleteStudent);

export const adminRoute = router;
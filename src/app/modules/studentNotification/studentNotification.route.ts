import express from 'express';
import { studentNotificationController } from './studentNotification.controller';
import { USER_ROLE } from '../user/user.constant';
import auth from '../../middlewares/auth';

const router = express.Router();

router
    .get(
        '/',
        auth(USER_ROLE.student),
        studentNotificationController.getStudentNotifications,
    )
    .patch(
        '/:notificationId',
        auth(USER_ROLE.student),
        studentNotificationController.makeReadStudentNotification,
    );

export const studentNotificationRoute = router;

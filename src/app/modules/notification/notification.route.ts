import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { notificationController } from './notification.controller';
import { notificationValidation } from './notification.validation';
import { USER_ROLE } from '../user/user.constant';

const router = express.Router();

router
    .post(
        '/',
        auth(),
        validateRequest(notificationValidation.createNotificationSchema),
        notificationController.createNotification
    )
    .post(
        '/send-bulk',
        auth(USER_ROLE.admin),
        notificationController.sendBulkNotification
    )
    .get(
        '/my-notifications',
        auth(),
        notificationController.getMyNotifications
    )
    .get(
        '/unread-count',
        auth(),
        notificationController.getUnreadCount
    )
    .patch(
        '/mark-as-read/:notificationId',
        auth(),
        notificationController.markAsRead
    )
    .patch(
        '/mark-all-as-read',
        auth(),
        notificationController.markAllAsRead
    );

export const notificationRoute = router;
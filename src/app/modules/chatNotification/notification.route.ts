import express from 'express';
import { NotificationController } from './notification.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import {
    getNotificationsZodSchema,
    notificationIdParamZodSchema,
} from './notification.validation';
import { USER_ROLE } from '../user/user.constant';

const router = express.Router();

// Get notifications for authenticated user
router.get(
    '/',
    auth(USER_ROLE.student, USER_ROLE.teacher, USER_ROLE.admin),
    validateRequest(getNotificationsZodSchema),
    NotificationController.getNotifications
);

// Get unread notification count
router.get(
    '/unread-count',
    auth(USER_ROLE.student, USER_ROLE.teacher, USER_ROLE.admin),
    NotificationController.getUnreadCount
);

// Mark notification as read
router.patch(
    '/:notificationId/read',
    auth(USER_ROLE.student, USER_ROLE.teacher, USER_ROLE.admin),
    validateRequest(notificationIdParamZodSchema),
    NotificationController.markAsRead
);

// Mark all notifications as read
router.patch(
    '/mark-all-read',
    auth(USER_ROLE.student, USER_ROLE.teacher, USER_ROLE.admin),
    NotificationController.markAllAsRead
);

export const notificationRoute = router;
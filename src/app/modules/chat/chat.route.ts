import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { chatController } from './chat.controller';
import { chatValidator } from './chat.validation';
import { USER_ROLE } from '../user/user.constant';

const router = express.Router();
router.use((req, res, next) => {
    console.log(`Incoming: ${req.method} ${req.originalUrl}`);
    next();
});


// Broadcast request routes
router.post(
    '/broadcast',
    auth(USER_ROLE.student),
    validateRequest(chatValidator.createBroadcastRequestSchema),
    chatController.createBroadcastRequest
);

router.get(
    '/broadcasts/pending',
    auth(USER_ROLE.teacher),
    chatController.getPendingBroadcastRequests
);

router.get(
    '/broadcasts/active',
    auth(USER_ROLE.student),
    chatController.getStudentActiveBroadcasts
);

router.post(
    '/broadcast/:broadcastId/accept',
    auth(USER_ROLE.teacher),
    validateRequest(chatValidator.broadcastActionSchema),
    chatController.acceptBroadcastRequest
);

router.post(
    '/broadcast/:broadcastId/decline',
    auth(USER_ROLE.teacher),
    validateRequest(chatValidator.broadcastActionSchema),
    chatController.declineBroadcastRequest
);

// Conversation routes
router.get(
    '/conversations',
    auth(),
    chatController.getActiveConversations
);

// Message routes
router.get(
    '/messages',
    auth(),
    validateRequest(chatValidator.getChatHistorySchema),
    chatController.getChatHistory
);

router.post(
    '/messages/:conversation_id/read',
    auth(),
    validateRequest(chatValidator.markMessagesAsReadSchema),
    chatController.markMessagesAsRead
);

router.get(
    '/messages/unread',
    auth(),
    chatController.getUnreadMessageCount
);

export const chatRoute = router;
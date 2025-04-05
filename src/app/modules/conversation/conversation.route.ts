import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import {
    createConversationZodSchema,
    getConversationsZodSchema,
    getConversationZodSchema,
    markConversationAsReadZodSchema,
} from './conversation.validation';
import { ConversationController } from './convesation.controller';

const router = express.Router();

// Create a conversation
router.post(
    '/',
    auth('student', 'teacher', 'admin'),
    validateRequest(createConversationZodSchema),
    ConversationController.createConversation
);

// Get all conversations
router.get(
    '/',
    auth('student', 'teacher', 'admin'),
    validateRequest(getConversationsZodSchema),
    ConversationController.getConversations
);

// Get a specific conversation
router.get(
    '/:id',
    auth('student', 'teacher', 'admin'),
    validateRequest(getConversationZodSchema),
    ConversationController.getConversation
);

// Mark conversation as read
router.patch(
    '/:id/read',
    auth('student', 'teacher', 'admin'),
    validateRequest(markConversationAsReadZodSchema),
    ConversationController.markConversationAsRead
);

export const conversationRoute = router;
import express from 'express';
import { MessageController } from './message.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { sendMessageZodSchema, getMessagesZodSchema } from './message.validation';
import { upload } from '../../middlewares/multerConfig';

const router = express.Router();

// Send a message
router.post(
    '/',
    auth('student', 'teacher', 'admin'),
    upload.any(),
    validateRequest(sendMessageZodSchema),
    MessageController.sendMessage
);

// Get messages for a conversation
router.get(
    '/:conversationId',
    auth('student', 'teacher', 'admin'),
    validateRequest(getMessagesZodSchema),
    MessageController.getMessages
);

export const messageRoute = router;
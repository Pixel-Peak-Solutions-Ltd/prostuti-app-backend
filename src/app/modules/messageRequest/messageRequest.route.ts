import express from 'express';
import { MessageRequestController } from './messageRequest.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import {
    createMessageRequestZodSchema,
    messageRequestParamsZodSchema,
    getPendingMessageRequestsZodSchema,
} from './messageRequest.validation';
import { upload } from '../../middlewares/multerConfig';
import { USER_ROLE } from '../user/user.constant';

const router = express.Router();

// Create a new message request (broadcast)
router.post(
    '/',
    auth(USER_ROLE.student),
    upload.any(),
    validateRequest(createMessageRequestZodSchema),
    MessageRequestController.createMessageRequest
);

// Get pending message requests for a teacher
router.get(
    '/pending',
    auth(USER_ROLE.teacher),
    validateRequest(getPendingMessageRequestsZodSchema),
    MessageRequestController.getPendingMessageRequests
);

// Accept a message request
router.post(
    '/:messageRequestId/accept',
    auth(USER_ROLE.teacher),
    validateRequest(messageRequestParamsZodSchema),
    MessageRequestController.acceptMessageRequest
);

// Decline a message request
router.post(
    '/:messageRequestId/decline',
    auth(USER_ROLE.teacher),
    validateRequest(messageRequestParamsZodSchema),
    MessageRequestController.declineMessageRequest
);

export const messageRequestRoute = router;
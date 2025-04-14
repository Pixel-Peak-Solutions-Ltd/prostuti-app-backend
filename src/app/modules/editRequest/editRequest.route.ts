import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { editRequestController } from './editRequest.controller';
import { editRequestValidation } from './editRequest.validation';
import { USER_ROLE } from '../user/user.constant';

const router = express.Router();

router
    .post(
        '/',
        auth(USER_ROLE.admin),
        validateRequest(editRequestValidation.requestEditSchema),
        editRequestController.requestEdit
    )
    .get(
        '/my-requests',
        auth(USER_ROLE.admin),
        editRequestController.getMyEditRequests
    );

export const editRequestRoute = router;
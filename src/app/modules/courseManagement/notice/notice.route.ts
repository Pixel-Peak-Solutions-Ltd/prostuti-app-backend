import express from 'express';
import { noticeController } from './notice.controller';
import validateRequest from '../../../middlewares/validateRequest';
import { noticeValidator } from './notice.validation';
import auth from '../../../middlewares/auth';
import { USER_ROLE } from '../../user/user.constant';

const router = express.Router();

router
    .post(
        '/',
        auth(USER_ROLE.teacher),
        validateRequest(noticeValidator.createNoticeValidationSchema),
        noticeController.createNotice,
    )
    .get('/course/:courseId', auth(), noticeController.getAllNoticesByCourseId)
    .get('/', noticeController.getAllNotices)
    .get('/:noticeId', noticeController.getNoticeByID)
    .delete('/:noticeId', noticeController.deleteNoticeByID)
    .patch(
        '/:noticeId',
        validateRequest(noticeValidator.updateNoticeValidationSchema),
        noticeController.updateNotice,
    );

export const noticeRoute = router;

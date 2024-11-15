import express from 'express';
import { noticeController } from './notice.controller';
import validateRequest from '../../../middlewares/validateRequest';
import { noticeValidator } from './notice.validation';
import auth from '../../../middlewares/auth';

const router = express.Router();

router
    .post(
        '/',
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

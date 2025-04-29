import express from 'express';
import { lessonController } from './lesson.controller';
import validateRequest from '../../../middlewares/validateRequest';
import { lessonValidator } from './lesson.validation';
import auth from '../../../middlewares/auth';
import { USER_ROLE } from '../../user/user.constant';

const router = express.Router();

router
    .post(
        '/',
        auth(USER_ROLE.teacher),
        validateRequest(lessonValidator.createLessonValidationSchema),
        lessonController.createLesson,
    )
    .get('/course/:courseId', auth(), lessonController.getAllLessonsByCourseId)
    .patch(
        '/:lessonId',
        auth(USER_ROLE.teacher),
        validateRequest(lessonValidator.updateLessonValidationSchema),
        lessonController.updateLesson,
    )
    .delete(
        '/:lessonId',
        auth(USER_ROLE.teacher),
        lessonController.deleteLessonByID,
    );

export const lessonRoute = router;

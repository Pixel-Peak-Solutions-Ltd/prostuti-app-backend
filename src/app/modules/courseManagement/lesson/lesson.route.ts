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
    .get('/', lessonController.getAllLessons)
    .get('/course/:courseId', lessonController.getAllLessonsByCourseId)
    .get('/:lessonId', lessonController.getLessonByID)
    .delete('/:lessonId', lessonController.deleteLessonByID)
    .patch('/:lessonId', lessonController.updateLesson);

export const lessonRoute = router;

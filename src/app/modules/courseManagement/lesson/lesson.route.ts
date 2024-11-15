import express from 'express';
import { lessonController } from './lesson.controller';
import validateRequest from '../../../middlewares/validateRequest';
import { lessonValidator } from './lesson.validation';

const router = express.Router();

router
    .post(
        '/',
        validateRequest(lessonValidator.createLessonValidationSchema),
        lessonController.createLesson,
    )
    .get('/', lessonController.getAllLessons)
    .get('/course/:courseId', lessonController.getAllLessonsByCourseId)
    .get('/:lessonId', lessonController.getLessonByID)
    .delete('/:lessonId', lessonController.deleteLessonByID)
    .patch('/:lessonId', lessonController.updateLesson);

export const lessonRoute = router;

import express, { NextFunction, Request, Response } from 'express';
import auth from '../../../middlewares/auth';
import { upload } from '../../../middlewares/multerConfig';
import validateRequest from '../../../middlewares/validateRequest';
import { USER_ROLE } from './../../user/user.constant';
import { courseController } from './course.controller';
import { courseValidator } from './course.validation';

const router = express.Router();

router
    .post(
        '/',
        auth(USER_ROLE.teacher),
        upload.single('coverImage'),
        (req: Request, res: Response, next: NextFunction) => {
            req.body = JSON.parse(req.body.courseData);
            next();
        },
        validateRequest(courseValidator.createCourseValidationSchema),
        courseController.createCourse,
    )
    .get('/preview/:courseId', auth(), courseController.getCoursePreview)
    .get('/', courseController.getAllCourses)
    .get('/:courseId', courseController.getCourseByID)
    .delete('/:courseId', courseController.deleteCourseByID)
    .patch(
        '/:courseId',
        auth(USER_ROLE.teacher, USER_ROLE.admin),
        upload.single('coverImage'),
        (req: Request, res: Response, next: NextFunction) => {
            req.body = JSON.parse(req.body.courseData);
            next();
        },
        validateRequest(courseValidator.updateCourseValidationSchema),
        courseController.updateCourse,
    );

export const courseRoute = router;

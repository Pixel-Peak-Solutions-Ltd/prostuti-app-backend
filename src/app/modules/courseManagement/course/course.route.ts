import express, { NextFunction, Request, Response } from 'express';
import { courseController } from './course.controller';
import { USER_ROLE } from '../../user/user.constant';
import { upload } from '../../../middlewares/multerConfig';
import auth from '../../../middlewares/auth';
import { courseValidator } from './course.validation';
import validateRequest from '../../../middlewares/validateRequest';

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
    .get('/', courseController.getAllCourses)
    .get('/:courseId', courseController.getCourseByID)
    .delete('/:courseId', courseController.deleteCourseByID)
    .patch('/:courseId', courseController.updateCourse);

export const courseRoute = router;

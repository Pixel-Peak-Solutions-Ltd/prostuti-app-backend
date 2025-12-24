import express, { NextFunction, Request, Response } from 'express';
import auth from '../../../middlewares/auth';
import { upload } from '../../../middlewares/multerConfig';
import validateRequest from '../../../middlewares/validateRequest';
import { USER_ROLE } from './../../user/user.constant';
import { courseController } from './course.controller';
import { courseValidator } from './course.validation';
import checkTeacherAccess from '../../../middlewares/checkTeacherAccess';
import { ASSIGNED_WORKS } from '../../teacher/teacher.constant';

const router = express.Router();

router
    .post(
        '/',
        auth(USER_ROLE.teacher),
        checkTeacherAccess(ASSIGNED_WORKS.Course),
        upload.single('coverImage'),
        (req: Request, res: Response, next: NextFunction) => {
            req.body = JSON.parse(req.body.courseData);
            next();
        },
        validateRequest(courseValidator.createCourseValidationSchema),
        courseController.createCourse,
    )
    .get('/all-courses', courseController.getAllCourses)
    .get(
        '/all-course-admin',
        auth(USER_ROLE.admin),
        courseController.getCoursesForAdmins,
    )
    .get(
        '/course-by-me',
        auth(USER_ROLE.teacher),
        checkTeacherAccess(ASSIGNED_WORKS.Course),
        courseController.getCourseByTeacherID,
    )
    .get('/preview/:courseId', auth(), courseController.getCoursePreview)
    .get(
        '/student-published-courses',
        auth(USER_ROLE.student),
        courseController.getPublishedCoursesForStudent,
    )
    .get('/:courseId', courseController.getCourseByID)
    .delete(
        '/:courseId',
        auth(USER_ROLE.teacher, USER_ROLE.admin),
        checkTeacherAccess(ASSIGNED_WORKS.Course),
        courseController.deleteCourseByID,
    )
    .patch(
        '/:courseId',
        auth(USER_ROLE.teacher, USER_ROLE.admin),
        checkTeacherAccess(ASSIGNED_WORKS.Course),
        upload.single('coverImage'),
        (req: Request, res: Response, next: NextFunction) => {
            req.body = JSON.parse(req.body.courseData);
            next();
        },
        validateRequest(courseValidator.updateCourseValidationSchema),
        courseController.updateCourse,
    )
    .post(
        '/approve/:courseId',
        auth(USER_ROLE.admin),
        validateRequest(courseValidator.approveCourseValidationSchema),
        courseController.approvedCourse,
    );

export const courseRoute = router;

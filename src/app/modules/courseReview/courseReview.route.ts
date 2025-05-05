import express from 'express';
import { courseReviewController } from './courseReview.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { createCourseReviewValidator } from './courseReview.validation';

const router = express.Router();

router
    .post(
        '/',
        auth(USER_ROLE.student),
        validateRequest(
            createCourseReviewValidator.createCourseReviewValidationSchema,
        ),
        courseReviewController.createCourseReview,
    )
    .get(
        '/:courseId',
        auth(USER_ROLE.student),
        courseReviewController.getAllReviewsOfACourse,
    );

export const courseReviewRoute = router;

import express from 'express';
import { recodedClassController } from './recodedClass.controller';
import validateRequest from '../../../middlewares/validateRequest';
import { recodedClassValidation } from './recodedClass.validation';
import auth from '../../../middlewares/auth';
import { USER_ROLE } from '../../user/user.constant';

const router = express.Router();

router
    .post(
        '/',
        auth(USER_ROLE.teacher),
        validateRequest(
            recodedClassValidation.createRecodedClassValidationSchema,
        ),
        recodedClassController.createRecodedClass,
    )
    .get(
        '/course/:courseId',
        auth(),
        recodedClassController.getAllCourseRecodedClassWithLessons,
    )
    .get('/', recodedClassController.getAllRecodedClass)
    .get('/:recodedClassId', recodedClassController.getRecodedClassByID)
    .delete('/:recodedClassId', recodedClassController.deleteRecodedClassByID)
    .patch(
        '/:recodedClassId',
        validateRequest(
            recodedClassValidation.updateRecodedClassValidationSchema,
        ),
        recodedClassController.updateRecodedClass,
    );

export const recodedClassRoute = router;

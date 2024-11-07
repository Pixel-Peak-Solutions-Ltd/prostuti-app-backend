import express from 'express';
import { recodedClassController } from './recodedClass.controller';
import validateRequest from '../../../middlewares/validateRequest';
import { recodedClassValidation } from './recodedClass.validation';

const router = express.Router();

router
    .post(
        '/',
        validateRequest(
            recodedClassValidation.createRecodedClassValidationSchema,
        ),
        recodedClassController.createRecodedClass,
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

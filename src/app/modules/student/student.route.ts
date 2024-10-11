import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { studentControllers } from './student.controller';
import { studentValidators } from './student.validation';

const router = express.Router();

router
    .post(
        '/',
        validateRequest(studentValidators.createStudentValidationSchema),
        studentControllers.createStudents,
    )
    .get('/', studentControllers.getAllStudents)
    .get('/:id', studentControllers.getStudentByID)
    .delete('/:id', studentControllers.deleteUserByID)
    .patch(
        '/:id',
        validateRequest(studentValidators.updateStudentValidationSchema),
        studentControllers.updateStudent,
    );

export const studentRoutes = router;

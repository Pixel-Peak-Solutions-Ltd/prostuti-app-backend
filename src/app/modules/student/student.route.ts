import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { studentController } from './student.controller';
import { studentValidator } from './student.validation';

const router = express.Router();

router
    .post(
        '/',
        validateRequest(studentValidator.createStudentValidationSchema),
        studentController.createStudents,
    )
    .get('/', studentController.getAllStudents)
    .get('/:id', studentController.getStudentByID)
    .delete('/:id', studentController.deleteUserByID)
    .patch(
        '/:id',
        validateRequest(studentValidator.updateStudentValidationSchema),
        studentController.updateStudent,
    );

export const studentRoute = router;

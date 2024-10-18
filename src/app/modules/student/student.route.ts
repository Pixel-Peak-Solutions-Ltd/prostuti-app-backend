import express from 'express';
import { studentController } from './student.controller';

const router = express.Router();

router
    .post('/', studentController.createStudents)
    .get('/', studentController.getAllStudents)
    .get('/:id', studentController.getStudentByID)
    .delete('/:id', studentController.deleteUserByID)
    .patch('/:id', studentController.updateStudent);

export const studentRoute = router;

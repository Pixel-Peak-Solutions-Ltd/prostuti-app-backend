import express from 'express';
import { userController } from './user.controller';

const router = express.Router();

router
    .post('/create-student', userController.createStudent)
    .post('/create-teacher', userController.createTeacher)
    .post('/create-admin', userController.createAdmin);

export const userRoute = router;

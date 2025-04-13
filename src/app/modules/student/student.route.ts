import express, { NextFunction, Request, Response } from 'express';
import { studentController } from './student.controller';
import { upload } from '../../middlewares/multerConfig';
import validateRequest from '../../middlewares/validateRequest';
import { studentValidator } from './student.validation';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';

const router = express.Router();

router
    .post('/', studentController.createStudents)
    .get('/', studentController.getAllStudents)
    .get('/:id', studentController.getStudentByID)
    .delete('/:id', studentController.deleteUserByID)
    .patch(
        '/profile/:studentId',
        auth(USER_ROLE.student),
        upload.single('avatar'),
        (req: Request, res: Response, next: NextFunction) => {
            req.body = JSON.parse(req.body.profileData);
            next();
        },
        validateRequest(studentValidator.updateStudentValidationSchema),
        studentController.updateStudent,
    )
    // New route for updating student category
    .patch(
        '/update-category',
        auth(USER_ROLE.student), // Only students can access this route
        validateRequest(studentValidator.updateStudentCategoryValidationSchema),
        studentController.updateStudentCategory
    );

export const studentRoute = router;
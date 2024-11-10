import express, { Request, Response, NextFunction } from 'express';
import { assignmentController } from './assignment.controller';
import auth from '../../../middlewares/auth';
import { USER_ROLE } from '../../user/user.constant';
import { upload } from '../../../middlewares/multerConfig';
import validateRequest from '../../../middlewares/validateRequest';
import { assignmentValidator } from './assignment.validation';

const router = express.Router();

router
    .post(
        '/',
        auth(USER_ROLE.teacher),
        upload.multiple('files'),
        (req: Request, res: Response, next: NextFunction) => {
            req.body = JSON.parse(req.body.data);
            next();
        },
        validateRequest(assignmentValidator.createAssignmentValidationSchema),
        assignmentController.createAssignment,
    )
    .get('/', assignmentController.getAllAssignments)
    .get('/:assignmentId', assignmentController.getAssignmentByID)
    .delete('/:assignmentId', assignmentController.deleteAssignmentByID)
    .patch(
        '/:assignmentId',
        auth(USER_ROLE.teacher),
        upload.multiple('files'),
        (req: Request, res: Response, next: NextFunction) => {
            req.body = JSON.parse(req.body.data);
            next();
        },
        validateRequest(assignmentValidator.updateAssignmentValidationSchema),
        assignmentController.updateAssignment,
    );

export const assignmentRoute = router;

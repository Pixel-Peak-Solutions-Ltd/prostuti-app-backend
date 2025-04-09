import express, { Request, Response, NextFunction } from 'express';
import auth from '../../middlewares/auth';
import { upload } from '../../middlewares/multerConfig';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../user/user.constant';
import { assignmentSubmissionController } from './assignmentSubmission.controller';
import { assignmentSubmissionValidator } from './assignmentSubmission.validation';

const router = express.Router();

router
    .post(
        '/',
        auth(USER_ROLE.student),
        upload.single('file'),
        (req: Request, res: Response, next: NextFunction) => {
            req.body = JSON.parse(req.body.data);
            next();
        },
        validateRequest(
            assignmentSubmissionValidator.assignmentSubmissionValidationSchema,
        ),
        assignmentSubmissionController.submitAssignment,
    )
    .get(
        '/:courseId/:assignmentId',
        auth(USER_ROLE.teacher),
        assignmentSubmissionController.getSubmittedAssignmentList,
    )
    .get(
        '/:assignmentSubmittedId',
        auth(USER_ROLE.teacher),
        assignmentSubmissionController.getASubmittedAssignment,
    )
    .patch(
        '/:assignmentSubmittedId',
        auth(USER_ROLE.teacher),
        validateRequest(
            assignmentSubmissionValidator.updateAssignmentSubmissionValidationSchema,
        ),
        assignmentSubmissionController.giveAssignmentMark,
    );

export const assignmentSubmissionRoute = router;

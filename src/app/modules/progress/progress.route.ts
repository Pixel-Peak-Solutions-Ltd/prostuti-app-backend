import express from 'express';
import { USER_ROLE } from '../user/user.constant';
import auth from '../../middlewares/auth';
import { progressController } from './progress.controller';

const router = express.Router();

router
    .post('/mark-as-complete',
        auth(USER_ROLE.student),
        // validateRequest(TestValidation.createTestSchema),
        progressController.createProgress
    )
    .get('/get-all-progress',
        progressController.getAllProgressFromDB
    )
    .get('/student-progress/:courseId', auth(USER_ROLE.student), progressController.getProgressByStudentAndCourseId)
    .get('/all-course-progress', auth(USER_ROLE.student), progressController.courseProgress);
// .get(
//     '/',
//     auth(),
//     TestController.getAllTests
// )
// .get('/:id', auth(), TestController.getTestByID)
// .delete('/:id', auth(), TestController.deleteTestByID)
// .patch('/:id', TestController.updateTest)
// .put('/markAsComplete/:testId', auth(), TestController.testCompletion);

export const ProgressRoute = router;
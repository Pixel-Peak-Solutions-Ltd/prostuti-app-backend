import express from 'express';
import auth from '../../../middlewares/auth';
import validateRequest from '../../../middlewares/validateRequest';
import { USER_ROLE } from '../../user/user.constant';
import { TestController } from './test.controller';
import { TestValidation } from './test.validation';



const router = express.Router();

router
    .post('/', auth(USER_ROLE.teacher), validateRequest(TestValidation.createTestSchema), TestController.createTest)
    .get(
        '/',
        auth(),
        TestController.getAllTests
    )
    .get('/:id', auth(), TestController.getTestByID)
    .delete('/:id', auth(), TestController.deleteTestByID)
    .patch('/:id', TestController.updateTest)
    .put('/markAsComplete/:testId', auth(), TestController.testCompletion);

export const TestRoute = router;

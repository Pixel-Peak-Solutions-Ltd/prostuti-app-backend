import express from 'express';
import { TestController } from './test.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { TestValidation } from './test.validation';



const router = express.Router();

router
    .post('/',auth(USER_ROLE.teacher),validateRequest(TestValidation.createTestSchema), TestController.createTest)
    .get('/',auth(), TestController.getAllTests)
    .get('/:id', TestController.getTestByID)
    .delete('/:id', TestController.deleteTestByID)
    .patch('/:id', TestController.updateTest);

export const TestRoute = router;

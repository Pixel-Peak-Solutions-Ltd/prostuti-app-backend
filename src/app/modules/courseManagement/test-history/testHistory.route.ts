import express from 'express';
import auth from '../../../middlewares/auth';
import validateRequest from '../../../middlewares/validateRequest';
import { USER_ROLE } from '../../user/user.constant';
import { TestHistoryValidation } from './testHistory.validation';
import { TestHistoryController } from './testHistory.controller';




const router = express.Router();

router
    .post('/submit-test',auth(USER_ROLE.student),validateRequest(TestHistoryValidation.createTestHistorySchema), TestHistoryController.createTestHistory)
    // .get('/',auth(), TestHistoryController.getAllTestHistorys)
    .get('/:id',auth(USER_ROLE.student), TestHistoryController.getTestHistoryByID)
    // .delete('/:id',auth(), TestHistoryController.deleteTestHistoryByID)
    // .patch('/:id', TestHistoryController.updateTestHistory);

export const TestHistoryRoute = router;

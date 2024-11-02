import express from 'express';
import { QuestionController } from './question.controller';
import auth from '../../middlewares/auth';
import { QuestionValidation } from './question.validation';
import validateRequest from '../../middlewares/validateRequest';



const router = express.Router();

router
    .post('/',auth("teacher"),validateRequest(QuestionValidation.createQuestion), QuestionController.createQuestion)
    .get('/', QuestionController.getAllCategories)
    .get('/:id',auth(), QuestionController.getQuestionByID)
    .delete('/:id', QuestionController.deleteQuestionByID)
    .patch('/:id', QuestionController.updateQuestion);

export const QuestionRoute = router;

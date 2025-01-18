import express from 'express';
import { QuestionController } from './question.controller';
import auth from '../../middlewares/auth';
import { QuestionValidation } from './question.validation';
import validateRequest from '../../middlewares/validateRequest';



const router = express.Router();

router
    .post('/',auth("teacher"),validateRequest(QuestionValidation.createQuestion), QuestionController.createQuestion)
    .get('/',auth(), QuestionController.getAllQuestions)
    .get('/:id',auth(), QuestionController.getQuestionByID)
    .delete('/:id',auth("teacher"), QuestionController.deleteQuestionByID)
    .patch('/:id',auth("teacher"), QuestionController.updateQuestion);

export const QuestionRoute = router;

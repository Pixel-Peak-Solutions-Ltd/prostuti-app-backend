import express from 'express';
import { QuestionPatternController } from './questionPattern.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { questionPatternValidation } from './questionPattern.validation';


const router = express.Router();

router
    .post('/create-question-pattern',auth("admin"),validateRequest(questionPatternValidation.createQuestionPatternSchema), QuestionPatternController.createQuestionPattern)
    .get('/', QuestionPatternController.getAllQuestionPatterns)
    .get('/:id', QuestionPatternController.getQuestionPatternByID)
    .delete('/:id', QuestionPatternController.deleteQuestionPatternByID)
    .patch('/:id', QuestionPatternController.updateQuestionPattern);

export const questionPatternRoute = router;

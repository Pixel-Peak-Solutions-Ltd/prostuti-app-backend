import express from 'express';
import { QuestionPatternController } from './questionPattern.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { questionPatternValidation } from './questionPattern.validation';


const router = express.Router();

router
    .post('/create-question-pattern',auth("admin"),validateRequest(questionPatternValidation.createQuestionPatternSchema), QuestionPatternController.createQuestionPattern)
    .get('/all-question-pattern',auth(), QuestionPatternController.getAllQuestionPatterns)
    .get('/single-question-pattern/:id',auth(), QuestionPatternController.getQuestionPatternByID)
    .delete('/:id',auth("admin"), QuestionPatternController.deleteQuestionPatternByID)
    .patch('/:id',auth("admin"),validateRequest(questionPatternValidation.updateQuestionPatternSchema), QuestionPatternController.updateQuestionPattern);

export const questionPatternRoute = router;

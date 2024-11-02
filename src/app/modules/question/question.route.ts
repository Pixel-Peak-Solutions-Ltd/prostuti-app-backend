import express from 'express';
import { QuestionController } from './question.controller';



const router = express.Router();

router
    .post('/', QuestionController.createQuestion)
    .get('/', QuestionController.getAllCategories)
    .get('/:id', QuestionController.getQuestionByID)
    .delete('/:id', QuestionController.deleteQuestionByID)
    .patch('/:id', QuestionController.updateQuestion);

export const QuestionRoute = router;

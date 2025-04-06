import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { quizValidation } from './quiz.validation';
import { QuizController } from './quiz.controller';
const router = express.Router();

router.post('/create-quiz',auth("student"),validateRequest(quizValidation.createQuiz), QuizController.createQuiz)

router.post('/submit-quiz',auth("student"),validateRequest(quizValidation.submitQuiz), QuizController.submitQuiz)
router.get('/all-quiz',auth(), QuizController.getAllQuizzes)


export const quizRoute = router;
import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { QuizController } from './quiz.controller';
import { quizValidation } from './quiz.validation';
const router = express.Router();



//mock quiz
router.post('/create-mock-quiz',auth("student"),validateRequest(quizValidation.createMockQuiz), QuizController.createMockQuiz)
router.patch('/submit-mock-quiz/:id',auth("student"),validateRequest(quizValidation.submitMockQuiz), QuizController.submitMockQuiz)

//quizzer
router.post('/create-quizzer-quiz',auth("student"),validateRequest(quizValidation.createQuizzerQuiz), QuizController.createQuizzerQuiz)
router.patch('/submit-quizzer-quiz/:id',auth("student"),validateRequest(quizValidation.submitQuizzerQuiz), QuizController.submitQuizzerQuiz)


router.get('/all-quiz',auth(), QuizController.getAllQuizzes)
router.get('/single-quiz/:id',auth(), QuizController.getSingleQuiz)




export const quizRoute = router;
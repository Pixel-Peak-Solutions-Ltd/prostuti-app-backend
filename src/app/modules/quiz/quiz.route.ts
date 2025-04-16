import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { QuizController } from './quiz.controller';
import { quizValidation } from './quiz.validation';
const router = express.Router();



//create mock quiz
router.post('/create-mock-quiz',auth("student"),validateRequest(quizValidation.createMockQuiz), QuizController.createMockQuiz)

router.patch('/submit-mock-quiz/:id',auth("student"),validateRequest(quizValidation.submitMockQuiz), QuizController.submitMockQuiz)
router.patch('/preview-written-mock-quiz/:id',auth("teacher"),validateRequest(quizValidation.previewWrittenMockQuiz),QuizController.previewWrittenMockQuiz)
router.get('/all-quiz',auth(), QuizController.getAllQuizzes)
router.get('/single-quiz/:id',auth(), QuizController.getSingleQuiz)




export const quizRoute = router;
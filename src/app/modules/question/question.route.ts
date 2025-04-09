import express, { NextFunction, Request, Response } from 'express';
import { QuestionController } from './question.controller';
import auth from '../../middlewares/auth';
import { QuestionValidation } from './question.validation';
import validateRequest from '../../middlewares/validateRequest';
import { upload } from '../../middlewares/multerConfig';

const router = express.Router();

router
    .post(
        '/',
        auth('teacher'),
        upload.any(),
        (req: Request, res: Response, next: NextFunction) => {
            req.body = JSON.parse(req.body.data);
            next();
        },
        validateRequest(QuestionValidation.createQuestion),
        QuestionController.createQuestion,
    )
    .get('/', auth(), QuestionController.getAllQuestions)
    .get('/:id', auth(), QuestionController.getQuestionByID)
    .delete('/:id', auth('teacher'), QuestionController.deleteQuestionByID)
    .patch(
        '/:id',
        auth('teacher'),
        upload.single("image"),
        (req: Request, res: Response, next: NextFunction) => {
            req.body = JSON.parse(req.body.data);
            next();
        },
        validateRequest(QuestionValidation.updateQuestion),
        QuestionController.updateQuestion,
    );

export const QuestionRoute = router;

import express from 'express';
import { USER_ROLE } from '../user/user.constant';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { favouriteQuestionValidation } from './favouriteQuestion.validation';
import { favouriteQuestionController } from './favouriteQuestion.controller';

const router = express.Router();

router.post('/question',
    auth(USER_ROLE.student),
    validateRequest(favouriteQuestionValidation.createFavouriteQuestionValidationSchema),
    favouriteQuestionController.createFavouriteQuestion
);
router.get('/question',
    auth(USER_ROLE.student),
    favouriteQuestionController.getFavouriteQuestions
);

router.delete('/question/:question_id',
    auth(USER_ROLE.student),
    favouriteQuestionController.deleteFavouriteQuestions
)

export const favouriteQuestionRoute = router;
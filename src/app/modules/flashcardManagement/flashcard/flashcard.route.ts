import express from 'express';
import { FlashcardController } from './flashcard.controller';
import auth from '../../../middlewares/auth';
import validateRequest from '../../../middlewares/validateRequest';
import { FlashcardValidation } from './flashcard.validation';



const router = express.Router();

router.post('/create-flashcard',auth("student"),validateRequest(FlashcardValidation.createFlashcard), FlashcardController.createFlashcard)
router.get('/all-flashcard',auth(), FlashcardController.getAllFlashcards)
router.get('/single-flashcard/:id',auth(), FlashcardController.getFlashcardByID)
router.delete('/:id', FlashcardController.deleteFlashcardByID)
router.patch('/:id', FlashcardController.updateFlashcard);

export const flashcardRoute = router;

import { StatusCodes } from 'http-status-codes';
import AppError from '../../../classes/errorClasses/AppError';
import { TJWTDecodedUser } from '../../../interfaces/jwt/jwt.type';
import { Student } from '../../student/student.model';
import { IFlashcardItem } from '../flashcardItem/flashcardItem.interface';
import { IFlashcard } from './flashcard.interface';
import { Flashcard } from './flashcard.model';
import { FlashcardItem } from '../flashcardItem/flashcardItem.model';
import { Category } from '../../category/category.model';
import mongoose from 'mongoose';

const createFlashcard = async (
    payload: Partial<IFlashcard & { items: Partial<IFlashcardItem>[] }>,
    userInfo: TJWTDecodedUser,
) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        // Fetch student and category in parallel
        const [studentDetails, checkCategory] = await Promise.all([
            Student.findOne({ user_id: userInfo.userId }),
            Category.findById(payload.categoryId),
        ]);

        if (!studentDetails) {
            throw new AppError(StatusCodes.NOT_FOUND, 'Student does not exist');
        }
        if (!checkCategory) {
            throw new AppError(StatusCodes.NOT_FOUND, 'Category does not exist');
        }

        // Validate flashcard items
        if (!payload.items || payload.items.length === 0) {
            throw new AppError(StatusCodes.BAD_REQUEST, 'Flashcard must have at least one item');
        }

        // Prepare and create flashcard
        const flashcard = new Flashcard({
            title: payload.title,
            visibility: payload.visibility,
            categoryId: checkCategory._id,
            studentId: studentDetails._id,
            isApproved: payload.visibility === 'ONLY_ME',
            approvedBy: payload.visibility === 'ONLY_ME' ? studentDetails._id : undefined,
        });
        await flashcard.save({ session });

        // Prepare and create flashcard items
        const flashcardItems = payload.items.map((item) => ({
            flashcardId: flashcard._id,
            term: item.term,
            answer: item.answer,
            viewCount: 0,
            favoritedBy: [],
        }));
        const createdItems = await FlashcardItem.insertMany(flashcardItems, { session });

        // Commit transaction
        await session.commitTransaction();
        return { flashcard, items: createdItems };
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        await session.endSession();
    }
};
const getAllFlashcards = async () => {
    return 'getAllFlashcards service';
};

const getFlashcardByID = async () => {
    return 'getFlashcardByID service';
};

const updateFlashcard = async () => {
    return 'updateFlashcard service';
};

const deleteFlashcardByID = async () => {
    return 'deleteFlashcardByID service';
};

export const FlashcardService = {
    createFlashcard,
    getAllFlashcards,
    getFlashcardByID,
    updateFlashcard,
    deleteFlashcardByID,
};

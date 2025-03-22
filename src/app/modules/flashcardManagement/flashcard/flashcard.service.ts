import { StatusCodes } from 'http-status-codes';
import AppError from '../../../classes/errorClasses/AppError';
import { TJWTDecodedUser } from '../../../interfaces/jwt/jwt.type';
import { Student } from '../../student/student.model';
import { IFlashcardItem } from '../flashcardItem/flashcardItem.interface';
import { IFlashcard, IFlashcardFilters } from './flashcard.interface';
import { Flashcard } from './flashcard.model';
import { FlashcardItem } from '../flashcardItem/flashcardItem.model';
import { Category } from '../../category/category.model';
import mongoose, { SortOrder } from 'mongoose';
import { IPaginationOptions } from '../../../interfaces/common';
import { calculatePagination } from '../../../helpers/pagenationHelper';
import { flashcardSearchableFields } from './flashcard.constant';

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
            throw new AppError(
                StatusCodes.NOT_FOUND,
                'Category does not exist',
            );
        }

        // Validate flashcard items
        if (!payload.items || payload.items.length === 0) {
            throw new AppError(
                StatusCodes.BAD_REQUEST,
                'Flashcard must have at least one item',
            );
        }

        // Prepare and create flashcard
        const flashcard = new Flashcard({
            title: payload.title,
            visibility: payload.visibility,
            categoryId: checkCategory._id,
            studentId: studentDetails._id,
            isApproved: payload.visibility === 'ONLY_ME',
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
        const createdItems = await FlashcardItem.insertMany(flashcardItems, {
            session,
        });

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
const getAllFlashcards = async (
    filters: IFlashcardFilters,
    paginationOptions: IPaginationOptions,
    userInfo: TJWTDecodedUser,
) => {
    const { searchTerm, ...filtersData } = filters;

    const { page, limit, skip, sortBy, sortOrder } =
        calculatePagination(paginationOptions);

    const andConditions = [];

    // searching data
    if (searchTerm) {
        andConditions.push({
            $or: flashcardSearchableFields.map((field) => ({
                [field]: {
                    $regex: searchTerm,
                    $options: 'i',
                },
            })),
        });
    }

    // filtering data
    if (Object.keys(filtersData).length) {
        andConditions.push({
            $and: Object.entries(filtersData).map(([field, value]) => ({
                [field]: value,
            })),
        });
    }
    const sortConditions: { [key: string]: SortOrder } = {};

    if (sortBy && sortOrder) {
        sortConditions[sortBy] = sortOrder;
    }

    const whereConditions =
        andConditions.length > 0 ? { $and: andConditions } : {};

    const count = await Flashcard.countDocuments(whereConditions);
    const result = await Flashcard.find(whereConditions)
        .sort(sortConditions)
        .skip(skip)
        .limit(limit)
        .populate('categoryId')
        .populate('studentId')
        .populate('approvedBy');

    return {
        meta: {
            page,
            limit: limit === 0 ? count : limit,
            count,
        },
        data: result,
    };
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

import { StatusCodes } from 'http-status-codes';
import AppError from '../../classes/errorClasses/AppError';
import { TJWTDecodedUser } from '../../interfaces/jwt/jwt.type';
import { Category } from '../category/category.model';
import { IQuestion, IQuestionFilters } from './question.interface';
import { Question } from './question.model';
import { IPaginationOptions } from '../../interfaces/common';
import { calculatePagination } from '../../helpers/pagenationHelper';
import { QuestionSearchableFields } from './question.constant';
import mongoose, { PipelineStage } from 'mongoose';
import { User } from '../user/user.model';

const createQuestion = async (
    userInfo: TJWTDecodedUser,
    payload: Partial<IQuestion>,
): Promise<any> => {
    const checkCategory = await Category.findById(payload.category_id);
    if (!checkCategory) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Category not found');
    }

    let newQuestion: Partial<IQuestion> = {
        type: payload.type,
        title: payload.title,
        description: payload.description,
    };

    if (payload.type === 'MCQ') {
        newQuestion.options = payload.options;
        newQuestion.correctOption = payload.correctOption;
    }

    const data = await Question.create({
        ...newQuestion,
        category_id: checkCategory._id,
        createdBy: userInfo.userId,
    });

    return data;
};

const getAllQuestions = async (
    filters: IQuestionFilters,
    paginationOptions: IPaginationOptions,
    userInfo: TJWTDecodedUser,
): Promise<any> => {
    const { searchTerm, ownQuestion, ...filtersData } = filters;
    const { page, limit, skip, sortBy, sortOrder } =
        calculatePagination(paginationOptions);

    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            $or: QuestionSearchableFields.map((field) => ({
                [field]: {
                    $regex: searchTerm,
                    $options: 'i',
                },
            })),
        });
    }

    if (ownQuestion === 'true') {
        andConditions.push({
            createdBy: new mongoose.Types.ObjectId(userInfo.userId),
        });
    }
    // filtering data
    if (Object.keys(filtersData).length) {
        andConditions.push({
            $and: Object.entries(filtersData).map(([field, value]) => {
                console.log(`Processing Field: ${field}, Value: ${value}`);
                if (field === 'type') {
                    return { [field]: value };
                } else if (field === 'categoryType') {
                    return { 'category.type': value };
                } else {
                    return { [`category.${field}`]: value };
                }
            }),
        });
    }

    type SortOrder = 1 | -1;
    const sortConditions: { [key: string]: SortOrder } = {};

    if (sortBy && sortOrder) {
        sortConditions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    const whereConditions =
        andConditions.length > 0 ? { $and: andConditions } : {};

    const pipeline: PipelineStage[] = [
        {
            $lookup: {
                from: 'categories',
                localField: 'category_id',
                foreignField: '_id',
                as: 'category',
            },
        },
        {
            $match: whereConditions,
        },
        {
            $sort: sortConditions,
        },
        {
            $skip: skip,
        },
    ];
    if (limit > 0) {
        pipeline.push({ $limit: limit });
    }

    const result = await Question.aggregate(pipeline);

    return {
        meta: {
            page,
            limit: limit === 0 ? result.length : limit,
            count: result.length,
        },
        data: result,
    };
};

const getQuestionByID = async (id: string): Promise<any> => {
    const data = await Question.findById(id)
        .populate('category_id')
        .populate('createdBy')
        .populate('updatedBy');
    if (!data) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Question not found');
    }
    return data;
};

const updateQuestion = async () => {
    return 'updateQuestion service';
};

const deleteQuestionByID = async (
    userInfo: TJWTDecodedUser,
    id: string,
): Promise<any> => {
    const checkUser = await User.findById(userInfo.userId);
    if (!checkUser) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Something went wrong');
    }

    const checkQuestion = await Question.findById(id);
    if (!checkQuestion) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Question not found.');
    }

    if (checkUser._id.toString() !== checkQuestion.createdBy.toString()) {
        throw new AppError(StatusCodes.UNAUTHORIZED, 'You can not delete it');
    }
    const data = await Question.findByIdAndDelete(id);
    return data;
};

export const QuestionService = {
    createQuestion,
    getAllQuestions,
    getQuestionByID,
    updateQuestion,
    deleteQuestionByID,
};

import { StatusCodes } from 'http-status-codes';
import AppError from '../../classes/errorClasses/AppError';
import { TJWTDecodedUser } from '../../interfaces/jwt/jwt.type';
import { Question } from '../question/question.model';
import { ITest, ITestFilters } from './test.interface';
import { Test } from './test.model';
import { IPaginationOptions } from '../../interfaces/common';
import { calculatePagination } from '../../helpers/pagenationHelper';
import { TestSearchableFields } from './test.constant';
import mongoose, { SortOrder } from 'mongoose';
import { User } from '../user/user.model';

const createTest = async (
    userInfo: TJWTDecodedUser,
    payload: Partial<ITest>,
): Promise<any> => {
    //check if reference question id exists or not
    const { questionList } = payload;

    const questionIds =
        questionList &&
        questionList.filter((q) => q.questionId).map((q) => q.questionId);

    if (questionIds && questionIds.length > 0) {
        const existingQuestions = await Question.find({
            _id: { $in: questionIds },
        }).select('_id');

        if (existingQuestions.length !== questionIds.length) {
            throw new AppError(
                StatusCodes.NOT_FOUND,
                'One or more questions do not exist in your question database',
            );
        }
    }

    //create new test
    const newTest = new Test({
        name: payload.name,
        type: payload.type,
        time: payload.time,
        questionList: payload.questionList,
        createdBy: userInfo.userId,
    });

    const data = await newTest.save();
    return data;
};

const getAllTests = async (
    filters: ITestFilters,
    paginationOptions: IPaginationOptions,
    userInfo: TJWTDecodedUser,
): Promise<any> => {
    const { searchTerm, ownTest, ...filtersData } = filters;
    const { page, limit, skip, sortBy, sortOrder } =
        calculatePagination(paginationOptions);

    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            $or: TestSearchableFields.map((field) => ({
                [field]: {
                    $regex: searchTerm,
                    $options: 'i',
                },
            })),
        });
    }

    if (ownTest === 'true') {
        andConditions.push({
            createdBy: new mongoose.Types.ObjectId(userInfo.userId),
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

    const count = await Test.countDocuments(whereConditions);
    const result = await Test.find(whereConditions)
        .sort(sortConditions)
        .skip(skip)
        .limit(limit);

    return {
        meta: {
            page,
            limit: limit === 0 ? count : limit,
            count,
        },
        data: result,
    };
};

const getTestByID = async (id: string): Promise<any> => {
    const data = await Test.findById(id);
    if (!data) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Test not found.');
    }

    return data;
};

const updateTest = async () => {
    return 'updateTest service';
};

const deleteTestByID = async (
    id: string,
    userInfo: TJWTDecodedUser,
): Promise<any> => {
    const checkUser = await User.findById(userInfo.userId);
    if (!checkUser) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Something went wrong');
    }

    const checkTest = await Test.findById(id);
    if (!checkTest) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Test not found.');
    }

    if (checkUser._id.toString() !== checkTest.createdBy.toString()) {
        throw new AppError(
            StatusCodes.UNAUTHORIZED,
            'You can not delete the test',
        );
    }
    const data = await Test.findByIdAndDelete(id);
    if (!data) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Delete Failed');
    }

    return data;
};

export const TestService = {
    createTest,
    getAllTests,
    getTestByID,
    updateTest,
    deleteTestByID,
};

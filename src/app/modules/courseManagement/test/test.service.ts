import { StatusCodes } from 'http-status-codes';
import mongoose, { SortOrder, Types } from 'mongoose';
import AppError from '../../../classes/errorClasses/AppError';
import { calculatePagination } from '../../../helpers/pagenationHelper';
import { IPaginationOptions } from '../../../interfaces/common';
import { TJWTDecodedUser } from '../../../interfaces/jwt/jwt.type';
import { Question } from '../../question/question.model';
import { User } from '../../user/user.model';
import { TestSearchableFields } from './test.constant';
import { ITest, ITestFilters } from './test.interface';
import { Test } from './test.model';
import { IQuestion } from '../../question/question.interface';
import { Course } from '../course/course.model';
import { Lesson } from '../lesson/lesson.model';

const createTest = async (
    userInfo: TJWTDecodedUser,
    payload: any,
): Promise<any> => {
    
 
    const {  questionList } = payload;

    // // Check if the course exist
    const checkCourse = await Course.findById(payload.course_id);
    if (!checkCourse) {
        throw new AppError(
            StatusCodes.NOT_FOUND,
            'Course does not exist with this ID',
        );
    }

        // Check if the course exist
    const isLessonExist = await Lesson.findById(payload.lesson_id);
    if (!isLessonExist) {
        throw new AppError(
            StatusCodes.NOT_FOUND,
            'Lesson does not exist with this ID',
        );
    }

    // Check if the lesson belongs to of tah course
    const isLessonBelongsToCourse = await Lesson.findOne({
        _id: payload.lesson_id,
        course_id: payload.course_id,
    });
    if (!isLessonBelongsToCourse) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'The lesson does not belong to the course',
        );
    }

    const allQuestionIds: string[] = [];

    for (const item of questionList) {
        if (item.questionId) {
            // Validate existing question ID
            const existingQuestion = await Question.findById(item.questionId).select('_id');
            if (!existingQuestion) {
                throw new AppError(StatusCodes.NOT_FOUND, `Question ID ${item.questionId} does not exist.`);
            }
            allQuestionIds.push(existingQuestion._id.toString());
        } else if (item.newQuestion) {
            
            const questionToSave = new Question({
                ...item.newQuestion,
                category_id: checkCourse.category_id,
                createdBy: new Types.ObjectId(userInfo.userId),
            });
            const savedQuestion = await questionToSave.save();
            allQuestionIds.push(savedQuestion._id.toString());
        }
    }


    //create new test
    const newTest = new Test({
        course_id: payload.course_id,
        lesson_id: payload.lesson_id,
        name: payload.name,
        type: payload.type,
        time: payload.time,
        publishDate: payload.publishDate && new Date(payload.publishDate),
        questionList: allQuestionIds,
        createdBy: userInfo.userId,
    });

    const data = await newTest.save();
    if (!data) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Creation Failed');
    }

    return data;
};

const getAllTests = async (
    filters: ITestFilters,
    paginationOptions: IPaginationOptions,
    userInfo: TJWTDecodedUser,
): Promise<any> => {
    const { searchTerm, ownTest, date, ...filtersData } = filters;
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
    //only returns the test that is created by the requested user
    if (ownTest === 'true') {
        andConditions.push({
            createdBy: new mongoose.Types.ObjectId(userInfo.userId),
        });
    }

    //only return the test those will be published that date
    if (date) {
        const checkDate = new Date(date);
        if (isNaN(checkDate.getTime())) {
            throw new AppError(
                StatusCodes.NOT_ACCEPTABLE,
                'Invalid date format!!!',
            );
        }
        checkDate.setHours(0, 0, 0, 0);

        andConditions.push({
            publishDate: {
                $gte: checkDate,
                $lt: new Date(
                    checkDate.getFullYear(),
                    checkDate.getMonth(),
                    checkDate.getDate() + 1,
                ),
            },
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
        .limit(limit)
        .populate({
            path: 'course_id',
        })
        .populate({
            path: 'lesson_id',
        })
        .populate({
            path: 'questionList',
        });

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
    const data = await Test.findById(id)
        .populate({
            path: 'lesson_id',
        })
        .populate({
            path: 'questionList', 
        });
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

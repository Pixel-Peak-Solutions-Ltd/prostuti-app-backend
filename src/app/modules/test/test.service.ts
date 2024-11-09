import { StatusCodes } from 'http-status-codes';
import AppError from '../../classes/errorClasses/AppError';
import { TJWTDecodedUser } from '../../interfaces/jwt/jwt.type';
import { Question } from '../question/question.model';
import { ITest } from './test.interface';
import { Test } from './test.model';

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
                'One or more referenced questions do not exist',
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

const getAllTests = async () => {
    return 'getAllCategories service';
};

const getTestByID = async () => {
    return 'getTestByID service';
};

const updateTest = async () => {
    return 'updateTest service';
};

const deleteTestByID = async () => {
    return 'deleteTestByID service';
};

export const TestService = {
    createTest,
    getAllTests,
    getTestByID,
    updateTest,
    deleteTestByID,
};

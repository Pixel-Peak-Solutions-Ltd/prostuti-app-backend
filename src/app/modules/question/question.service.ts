import { StatusCodes } from 'http-status-codes';
import AppError from '../../classes/errorClasses/AppError';
import { TJWTDecodedUser } from '../../interfaces/jwt/jwt.type';
import { Category } from '../category/category.model';
import { IQuestion } from './question.interface';
import { Question } from './question.model';

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

const getAllCategories = async () => {
    return 'getAllCategories service';
};

const getQuestionByID = async (
    
    id:string
): Promise<any>  => {
    const data = await Question.findById(id).populate("category_id").populate("createdBy").populate("updatedBy")
    if (!data) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Question not found');
      }
    return data
    
};

const updateQuestion = async () => {
    return 'updateQuestion service';
};

const deleteQuestionByID = async () => {
    return 'deleteQuestionByID service';
};

export const QuestionService = {
    createQuestion,
    getAllCategories,
    getQuestionByID,
    updateQuestion,
    deleteQuestionByID,
};

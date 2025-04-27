import { StatusCodes } from "http-status-codes";
import AppError from "../../classes/errorClasses/AppError";
import { TJWTDecodedUser } from "../../interfaces/jwt/jwt.type";
import { Admin } from "../admin/admin.model";
import { IQuestionPattern } from "./questionPattern.interface";
import { Types } from "mongoose";
import { Category } from "../category/category.model";
import { QuestionPattern } from "./questionPattern.model";

const createQuestionPattern = async (userInfo:TJWTDecodedUser,payload:Partial<IQuestionPattern>) => {
    //check admin is exist or not
    const checkAdmin = await Admin.findOne({ user_id: userInfo.userId });
    if(!checkAdmin) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Admin not found');    
    }

   // Check category exists
  if (payload.category_id) {
    await Promise.all(
      payload.category_id.map(async (categoryId: Types.ObjectId) => {
        const checkCategory = await Category.findOne({ _id: categoryId });
        if (!checkCategory) {
          throw new AppError(StatusCodes.NOT_FOUND, `Category ${categoryId} not found`);
        }
      })
    );
  }

    //create question pattern
    const questionPattern = await QuestionPattern.create({
        ...payload,
        createdBy: checkAdmin._id,
    });
    if (!questionPattern) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Question pattern not created');
    }
    await questionPattern.populate('category_id');
    await questionPattern.populate('createdBy');
    return questionPattern;
    

};

const getAllQuestionPatterns = async () => {
    return 'getAllQuestionPatterns service';
};

const getQuestionPatternByID = async () => {
    return 'getQuestionPatternByID service';
};

const updateQuestionPattern = async () => {
    return 'updateQuestionPattern service';
};

const deleteQuestionPatternByID = async () => {
    return 'deleteQuestionPatternByID service';
};

export const QuestionPatternService = {
    createQuestionPattern,
    getAllQuestionPatterns,
    getQuestionPatternByID,
    updateQuestionPattern,
    deleteQuestionPatternByID,
};


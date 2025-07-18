import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../classes/errorClasses/AppError';
import { paginationFields } from '../../constant';
import pick from '../../helpers/pick';
import { TJWTDecodedUser } from '../../interfaces/jwt/jwt.type';
import catchAsync from '../../utils/catchAsync';
import sendSuccessResponse from '../../utils/sendSuccessResponse';
import { Teacher } from '../teacher/teacher.model';
import { createTeacherLog } from '../teacherLog/teacherLog.utils';
import { QuestionFilterableFields } from './question.constant';
import { QuestionService } from './question.service';



const createQuestion = catchAsync(async (req: Request, res: Response) => {
    const result = await QuestionService.createQuestion(req.user,req.body,req.files as  Express.Multer.File[]);
    //check teacher
    const checkTeacher=await Teacher.findOne({user_id:req.user.userId})
    if(!checkTeacher){
        throw new AppError(StatusCodes.NOT_FOUND, 'Teacher is not found');
    }
    const questionIds = result.map((q: any) => q._id).join(', ');
    await createTeacherLog(req,checkTeacher._id.toString(),"Create_Question",`Created a question with IDs ${questionIds}`)

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Question created successfully',
        data: result,
    });
});

const getAllQuestions = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, QuestionFilterableFields);
  const paginationOptions = pick(req.query, paginationFields);
    const result = await QuestionService.getAllQuestions( filters,
        paginationOptions,
        req.user as TJWTDecodedUser);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Questions are retrieved successfully',
        data: result,
    });
});

const getQuestionByID = catchAsync(async (req: Request, res: Response) => {
    const result = await QuestionService.getQuestionByID(req.params.id);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Single Question retrieved successfully',
        data: result,
    });
});

const updateQuestion = catchAsync(async (req: Request, res: Response) => {
    const result = await QuestionService.updateQuestion(req.user,req.params.id,req.body,req.file as  Express.Multer.File);
    const checkTeacher=await Teacher.findOne({user_id:req.user.userId})
    if(!checkTeacher){
        throw new AppError(StatusCodes.NOT_FOUND, 'Teacher is not found');
    }
    await createTeacherLog(req,checkTeacher._id.toString(),"Update_Question",`Updated a question with ID ${result._id}`)

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Question is updated successfully',
        data: result,
    });
});
const reviewQuestion = catchAsync(async (req: Request, res: Response) => {
    const result = await QuestionService.reviewQuestion(req.user,req.params.id,req.body);
    const checkTeacher=await Teacher.findOne({user_id:req.user.userId})
    if(!checkTeacher){
        throw new AppError(StatusCodes.NOT_FOUND, 'Teacher is not found');
    }
    await createTeacherLog(req,checkTeacher._id.toString(),"Review_Question",`Reviewed a question with ID ${result._id}`)

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Question is updated successfully',
        data: result,
    });
});

const deleteQuestionByID = catchAsync(async (req: Request, res: Response) => {
    const result = await QuestionService.deleteQuestionByID(req.user,req.params.id);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Question is deleted successfully',
        data: result,
    });
});

export const QuestionController = {
    createQuestion,
    getAllQuestions,
    getQuestionByID,
    updateQuestion,
    reviewQuestion,
    deleteQuestionByID,
};

import { StatusCodes } from "http-status-codes";
import AppError from "../../classes/errorClasses/AppError";
import { TJWTDecodedUser } from "../../interfaces/jwt/jwt.type";
import { Category } from "../category/category.model";
import { Student } from "../student/student.model";
import { Question } from "../question/question.model";
import { Quiz } from "./quiz.model";

const createQuiz = async (userInfo:TJWTDecodedUser,payload:{category_id:string,questionCount:number}) => {
    //check category
    const checkCategory = await Category.findById(payload.category_id);
    if (!checkCategory) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Category not found');
    }

    //check student
    const checkStudent = await Student.findOne({ user_id: userInfo.userId });
    if (!checkStudent) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Student not found');
    }

    // Set default question count
  const questionCount = payload.questionCount || 10; 

  // Get random questions from the category
  const questions = await Question.aggregate([
    { $match: { category_id: checkCategory._id } },
    { $sample: { size: questionCount } },
  ]);

  if (questions.length < questionCount) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `Not enough questions available. Required: ${questionCount}, Found: ${questions.length}`
    );
  }

  // Create quiz
  const quizData = {
    student_id: checkStudent._id,
    category_id: checkCategory._id,
    questions: questions.map((q) => q._id),
    totalQuestions: questionCount,
    score: 0,
  };

  const quiz = await Quiz.create(quizData);

  // Return populated quiz
  const populatedQuiz = await Quiz.findById(quiz._id)
    .populate('questions')
    .populate('category_id')
    .populate('student_id')
    .lean();

  if (!populatedQuiz) {
    throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to create quiz');
  }
  
  return populatedQuiz;
};

export const QuizService = {createQuiz}
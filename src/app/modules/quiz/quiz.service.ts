import { StatusCodes } from 'http-status-codes';
import AppError from '../../classes/errorClasses/AppError';
import { TJWTDecodedUser } from '../../interfaces/jwt/jwt.type';
import { Category } from '../category/category.model';
import { Student } from '../student/student.model';
import { Question } from '../question/question.model';
import { Quiz } from './quiz.model';
import mongoose, { SortOrder } from 'mongoose';
import { QuestionType } from '../question/question.constant';
import { IQuizFilters } from './quiz.interface';
import { IPaginationOptions } from '../../interfaces/common';
import { calculatePagination } from '../../helpers/pagenationHelper';
import { quizSearchableFields } from './quiz.constant';

const createQuiz = async (
    userInfo: TJWTDecodedUser,
    payload: { category_id: string; type: QuestionType; questionCount: number },
) => {
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
        { $match: { category_id: checkCategory._id, type: payload.type } },
        { $sample: { size: questionCount } },
    ]);

    if (questions.length < questionCount) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            `Not enough questions available. Required: ${questionCount}, Found: ${questions.length}`,
        );
    }

    // Create quiz
    const quizData = {
        student_id: checkStudent._id,
        category_id: checkCategory._id,
        type: payload.type,
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
        throw new AppError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            'Failed to create quiz',
        );
    }

    return populatedQuiz;
};

const submitQuiz = async (
    userInfo: TJWTDecodedUser,
    payload: {
        quiz_id: string;
        answers: { question_id: string; selectedOption: string }[];
    },
) => {
    //check student
    const checkStudent = await Student.findOne({ user_id: userInfo.userId });
    if (!checkStudent) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Student not found');
    }
    //check quiz
    const checkQuiz = await Quiz.findById(payload.quiz_id).populate(
        'questions',
        'correctOption',
    );
    if (!checkQuiz) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Quiz not found');
    }

    // Verify checkQuiz belongs to the student
    if (checkQuiz.student_id.toString() !== checkStudent._id.toString()) {
        throw new AppError(
            StatusCodes.FORBIDDEN,
            'You are not authorized to submit this Quiz',
        );
    }

    // Check if quiz is already completed
    if (checkQuiz.completedAt) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Quiz already completed');
    }

    // Validate answers
    if (!payload.answers || payload.answers.length === 0) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'No answers provided');
    }

    // Check if all questions are answered
    if (payload.answers.length !== checkQuiz.totalQuestions) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            `All questions must be answered. Expected ${checkQuiz.totalQuestions}, received ${payload.answers.length}`,
        );
    }

    // Check for duplicate questionIds in answers
    const submittedQuestionIds = payload.answers.map((a) => a.question_id);
    const uniqueQuestionIds = new Set(submittedQuestionIds);
    if (uniqueQuestionIds.size !== submittedQuestionIds.length) {
        const duplicates = submittedQuestionIds.filter(
            (id, index) => submittedQuestionIds.indexOf(id) !== index,
        );
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            `Duplicate question IDs detected: ${[...new Set(duplicates)].join(', ')}`,
        );
    }

    // Validate question IDs match quiz questions
    const quizQuestionIds = checkQuiz.questions.map((q: any) =>
        q._id.toString(),
    );
    const invalidQuestionIds = submittedQuestionIds.filter(
        (id) => !quizQuestionIds.includes(id),
    );
    if (invalidQuestionIds.length > 0) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            `Invalid question IDs provided: ${invalidQuestionIds.join(', ')}`,
        );
    }

    // Calculate score
    let score = 0;
    const questionMap = new Map(
        checkQuiz.questions.map((q: any) => [
            q._id.toString(),
            q.correctOption,
        ]),
    );

    const formattedAnswers = payload.answers.map((answer) => ({
        question_id: new mongoose.Types.ObjectId(answer.question_id), // Use questionId to match schema
        selectedOption: answer.selectedOption,
    }));

    formattedAnswers.forEach((answer) => {
        const correctOption = questionMap.get(answer.question_id.toString()); // Convert ObjectId to string
        if (correctOption === answer.selectedOption) {
            score++;
        }
    });

    // Update quiz
    checkQuiz.answers = formattedAnswers;
    checkQuiz.score = score;
    checkQuiz.completedAt = new Date();

    await checkQuiz.save();

    // Return result with populated data
    const result = await Quiz.findById(checkQuiz._id)
        .populate('category_id')
        .populate('student_id')
        .lean();

    return {
        quiz: result,
        score,
        totalQuestions: checkQuiz.totalQuestions,
        percentage: (score / checkQuiz.totalQuestions) * 100,
    };
};

const getAllQuizzes = async (
    filters: IQuizFilters,
    paginationOptions: IPaginationOptions,
): Promise<{ meta: any; data: any[] }> => {
    const { searchTerm, ...filtersData } = filters;

    const { page, limit, skip, sortBy, sortOrder } =
        calculatePagination(paginationOptions);

    const andConditions = [];

    // searching data
    if (searchTerm) {
        andConditions.push({
            $or: quizSearchableFields.map((field) => ({
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

    const count = await Quiz.countDocuments(whereConditions);
    const result = await Quiz.find(whereConditions)
        .populate('student_id') 
        .populate('category_id') 
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
export const QuizService = { createQuiz, submitQuiz, getAllQuizzes };

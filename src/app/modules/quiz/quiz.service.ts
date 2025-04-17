import { StatusCodes } from 'http-status-codes';
import mongoose, { SortOrder } from 'mongoose';
import AppError from '../../classes/errorClasses/AppError';
import { calculatePagination } from '../../helpers/pagenationHelper';
import { IPaginationOptions } from '../../interfaces/common';
import { TJWTDecodedUser } from '../../interfaces/jwt/jwt.type';
import { Category } from '../category/category.model';
import { QuestionType } from '../question/question.constant';
import { Question } from '../question/question.model';
import { Student } from '../student/student.model';
import { quizSearchableFields } from './quiz.constant';
import { IQuizFilters } from './quiz.interface';
import { Quiz } from './quiz.model';

const createMockQuiz = async (
    userInfo: TJWTDecodedUser,
    payload: {
        questionType: QuestionType;
        subjects: string[];
        questionCount: number;
        isNegativeMarking: boolean;
        time: number;
    },
) => {
    //check student
    const checkStudent = await Student.findOne({ user_id: userInfo.userId });
    if (!checkStudent) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Student not found');
    }

    //subject
    const categoryFilter = {
        $or: payload.subjects.map((subject) => ({
            subject: { $regex: subject, $options: 'i' },
        })),
    };

    //check category
    const checkCategory = await Category.find(categoryFilter)
        .select({ _id: 1, subject: 1 })
        .lean();
    if (!checkCategory || checkCategory.length === 0) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Category not found');
    }

    // Set default question count
    const questionCount = payload.questionCount || 10;

    // Get random questions from the category

    // Create a $facet pipeline dynamically for each category
    const facets = checkCategory.reduce((acc, category) => {
        acc[category._id] = [
            {
                $match: {
                    category_id: category._id,
                    type: payload.questionType,
                },
            },
            {
                $sample: { size: questionCount },
            },
        ];
        return acc;
    }, {});

    const result = await Question.aggregate([
        {
            $facet: facets,
        },
    ]).exec();

    // Flatten the result if you want a single array of questions
    const questionArray = Object.values(result[0]).flat();
    // Filter out duplicates by question `_id`
    const questions = Array.from(
        new Map(questionArray.map((q:any) => [q._id.toString(), q])).values(),
    );

    if (questions.length < questionCount*payload.subjects.length) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            `Not enough questions available. Required: ${questionCount*payload.subjects.length}, Found: ${questions.length}`,
        );
    }

    // Create quiz
    const quizData = {
        student_id: checkStudent._id,
        category_id: checkCategory.map((cat) => cat._id),
        type: 'Mock',
        time: payload.time,
        questionCount,
        isNegativeMarking: payload.isNegativeMarking,
        questionType: payload.questionType,
        questions: questions.map((q) => q._id),
        answers: [],
        totalScore: questions.length,
        score: 0,
        rightScore: 0,
        wrongScore: 0,
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

const submitMockQuiz = async (
    userInfo: TJWTDecodedUser,
    payload: {
        answers: { question_id: string; selectedOption: string }[];
    },
    quiz_id: string,
) => {
    //check student
    const checkStudent = await Student.findOne({ user_id: userInfo.userId });
    if (!checkStudent) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Student not found');
    }
    //check quiz
    const checkQuiz = await Quiz.findById(quiz_id).populate(
        'questions',
        'correctOption',
    );
    if (!checkQuiz) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Quiz not found');
    }
    if (checkQuiz.type !== 'Mock') {
        throw new AppError(
            StatusCodes.FORBIDDEN,
            'This route is only for mock quiz',
        );
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
    if (payload.answers.length !== checkQuiz.questions.length) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            `All questions must be answered. Expected ${checkQuiz.questions.length}, received ${payload.answers.length}`,
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

    // Initialize formatted answers
    const formattedAnswers = [];
    let score = 0;
    let rightScore = 0;
    let wrongScore = 0;

    // Handle MCQ and Written quizzes differently
    if (checkQuiz.questionType === 'MCQ') {
        // Validate selectedOption for MCQ questions
        const questionMap = new Map(
            checkQuiz.questions.map((q: any) => [
                q._id.toString(),
                { correctOption: q.correctOption, options: q.options || [] },
            ]),
        );
        const invalidOptions = payload.answers.filter((answer) => {
            const question = questionMap.get(answer.question_id);
            return question && question.options.length > 0
                ? !question.options.includes(answer.selectedOption)
                : false;
        });
        if (invalidOptions.length > 0) {
            throw new AppError(
                StatusCodes.BAD_REQUEST,
                `Invalid selected options for question IDs: ${invalidOptions
                    .map((a) => a.question_id)
                    .join(', ')}`,
            );
        }

        // Calculate scores for MCQ
        const negativeMarkingValue = checkQuiz.isNegativeMarking ? 0.5 : 0;
        formattedAnswers.push(
            ...payload.answers.map((answer) => {
                const question = questionMap.get(answer.question_id);
                // Skip answer
                if (answer.selectedOption === 'null') {
                    return {
                        question_id: new mongoose.Types.ObjectId(
                            answer.question_id,
                        ),
                        selectedOption: answer.selectedOption,
                        mark: 0, // Default mark for null answers
                    };
                }
                const isCorrect =
                    question?.correctOption === answer.selectedOption;
                if (isCorrect) {
                    rightScore++;
                } else {
                    wrongScore++;
                }
                return {
                    question_id: new mongoose.Types.ObjectId(
                        answer.question_id,
                    ),
                    selectedOption: answer.selectedOption,
                    mark: isCorrect ? 1 : 0,
                };
            }),
        );

        // Calculate final score
        score = rightScore - wrongScore * negativeMarkingValue;
    } else if (checkQuiz.questionType === 'Written') {
        // No scoring for written quizzes
        score = 0;
        rightScore = 0;
        wrongScore = 0;

        formattedAnswers.push(
            ...payload.answers.map((answer) => ({
                question_id: new mongoose.Types.ObjectId(answer.question_id),
                selectedOption: answer.selectedOption, // No mark for written
            })),
        );
    } else {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            `Unsupported question type: ${checkQuiz.questionType}`,
        );
    }

    // Update quiz
    checkQuiz.answers = formattedAnswers;
    checkQuiz.score = score < 0 ? 0 : score;
    checkQuiz.rightScore = rightScore;
    checkQuiz.wrongScore = wrongScore;
    
    checkQuiz.completedAt = new Date();

    await checkQuiz.save();

    // Return result with populated data
    const result = await Quiz.findById(checkQuiz._id)
        .populate('category_id')
        .populate('student_id')
        .lean();

    return result;
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

const getSingleQuiz = async (id: string, userInfo: TJWTDecodedUser) => {
    const checkQuiz = await Quiz.findById(id)
        .populate('questions')
        .populate('student_id')
        .populate('category_id')
        .populate('answers.question_id');
    if (!checkQuiz) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Quiz not found');
    }

    if (userInfo.role === 'student') {
        const checkStudent = await Student.findOne({
            user_id: userInfo.userId,
        });
        if (!checkStudent) {
            throw new AppError(StatusCodes.NOT_FOUND, 'Student not found');
        }
        // Verify checkQuiz belongs to the student
        if (
            checkQuiz.student_id._id.toString() !== checkStudent._id.toString()
        ) {
            throw new AppError(
                StatusCodes.FORBIDDEN,
                'You are not authorized to view this Quiz',
            );
        }
        return checkQuiz;
    } else {
        return checkQuiz;
    }
};
export const QuizService = {
    createMockQuiz,
    submitMockQuiz,

    getAllQuizzes,
    getSingleQuiz,
};

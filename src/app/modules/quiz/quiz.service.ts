import { StatusCodes } from 'http-status-codes';
import mongoose, { SortOrder } from 'mongoose';
import AppError from '../../classes/errorClasses/AppError';
import { calculatePagination } from '../../helpers/pagenationHelper';
import { IPaginationOptions } from '../../interfaces/common';
import { TJWTDecodedUser } from '../../interfaces/jwt/jwt.type';
import { QuestionType } from '../question/question.constant';
import { Question } from '../question/question.model';
import { Student } from '../student/student.model';
import { quizSearchableFields } from './quiz.constant';
import { IQuizFilters } from './quiz.interface';
import { Quiz } from './quiz.model';
import { Category } from '../category/category.model';
import { Teacher } from '../teacher/teacher.model';

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

    const questions = await Question.aggregate([
        {
            $match: {
                category_id: { $in: checkCategory.map((cat) => cat._id) },
                type: payload.questionType,
            },
        },
        { $sample: { size: questionCount } },
    ]).exec();

    if (questions.length < questionCount) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            `Not enough questions available. Required: ${questionCount}, Found: ${questions.length}`,
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
    if (payload.answers.length !== checkQuiz.questionCount) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            `All questions must be answered. Expected ${checkQuiz.questionCount}, received ${payload.answers.length}`,
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
    const totalScore = checkQuiz.questionCount;

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
                    mark: isCorrect ? 1 : 0, // Include mark for MCQ
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
    checkQuiz.totalScore = totalScore;
    checkQuiz.completedAt = new Date();

    await checkQuiz.save();

    // Return result with populated data
    const result = await Quiz.findById(checkQuiz._id)
        .populate('category_id')
        .populate('student_id')
        .lean();

    return result;
};

const previewWrittenMockQuiz = async (
    userInfo: TJWTDecodedUser,
    payload: {
        answers: {
            question_id: string;
            selectedOption: string;
            mark: number;
        }[];
    },
    quiz_id: string,
) => {
    // Check teacher
    const checkTeacher = await Teacher.findOne({ user_id: userInfo.userId });
    if (!checkTeacher) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Teacher not found');
    }

    // Check quiz and populate relevant fields
    const checkQuiz = await Quiz.findById(quiz_id).populate(
        'questions',
        'title description correctOption options type',
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
    if (checkQuiz.questionType !== 'Written') {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'This route is only for previewing written mock quizzes',
        );
    }
    // Verify quiz is submitted
    if (!checkQuiz.completedAt) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'Quiz has not been submitted',
        );
    }

    // Validate payload answers
    if (!payload.answers || payload.answers.length === 0) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'No answers provided');
    }

    // Check if all questions are answered
    if (payload.answers.length !== checkQuiz.questionCount) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            `All questions must be answered. Expected ${checkQuiz.questionCount}, received ${payload.answers.length}`,
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

    // Validate and prepare updated answers
    const updatedAnswers = checkQuiz.answers.map((storedAnswer: any) => {
        const payloadAnswer = payload.answers.find(
            (a) => a.question_id === storedAnswer.question_id.toString(),
        );
        if (!payloadAnswer) {
            throw new AppError(
                StatusCodes.BAD_REQUEST,
                `Missing answer for question ID: ${storedAnswer.question_id}`,
            );
        }

        // Validate mark
        if (
            typeof payloadAnswer.mark !== 'number' ||
            payloadAnswer.mark < 0 ||
            payloadAnswer.mark > 1
        ) {
            throw new AppError(
                StatusCodes.BAD_REQUEST,
                `Mark must be between 0 and 1 for question ID: ${payloadAnswer.question_id}`,
            );
        }

        // Validate selectedOption presence (no matching)
        if (!payloadAnswer.selectedOption) {
            throw new AppError(
                StatusCodes.BAD_REQUEST,
                `Selected option cannot be empty for question ID: ${payloadAnswer.question_id}`,
            );
        }

        return {
            question_id: storedAnswer.question_id,
            selectedOption: storedAnswer.selectedOption,
            mark: payloadAnswer.mark,
        };
    });

    // Calculate scores based on marks
    let score = 0;
    let rightScore = 0;
    updatedAnswers.forEach((answer: any) => {
        if (answer.mark > 0) {
            rightScore++;
            score += answer.mark;
        }
    });
    const totalScore = checkQuiz.questionCount;

    // Update quiz
    checkQuiz.answers = updatedAnswers;
    checkQuiz.score = score;
    checkQuiz.rightScore = rightScore;
    checkQuiz.wrongScore = 0; // No wrong score for written quizzes
    checkQuiz.totalScore = totalScore;

    await checkQuiz.save();

    // Return updated quiz with populated data
    const result = await Quiz.findById(checkQuiz._id)
        .populate('questions', 'title description correctOption options type')
        .populate('category_id', 'name')
        .populate('student_id', 'name email')
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
    previewWrittenMockQuiz,
    getAllQuizzes,
    getSingleQuiz,
};

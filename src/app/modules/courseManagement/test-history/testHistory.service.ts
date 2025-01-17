import { StatusCodes } from 'http-status-codes';
import AppError from '../../../classes/errorClasses/AppError';
import { TJWTDecodedUser } from '../../../interfaces/jwt/jwt.type';
import { EnrolledCourse } from '../../enrolledCourse/enrolledCourse.model';
import { Question } from '../../question/question.model';
import { Student } from '../../student/student.model';
import { Teacher } from '../../teacher/teacher.model';
import { Course } from '../course/course.model';
import { Lesson } from '../lesson/lesson.model';
import { Test } from '../test/test.model';
import { TestHistory } from './testHistory.model';

const createTestHistory = async (
    userInfo: TJWTDecodedUser,
    payload: any,
): Promise<any> => {
    const { course_id, lesson_id, test_id, answers, timeTaken } = payload;
    // Get student details
    const studentDetails = await Student.findOne({ user_id: userInfo.userId });
    if (!studentDetails) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Student does not exist');
    }
    //check if the student is already have test history for this course
    const checkTestHistory = await TestHistory.findOne({
        test_id,
        student_id: studentDetails._id,
    });
    if (checkTestHistory) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'You have already attempted this test.',
        );
    }

    // Check if student is enrolled in the course
    const checkEnrolled = await EnrolledCourse.findOne({
        course_id: course_id,
        student_id: studentDetails._id,
    });
    if (!checkEnrolled) {
        throw new AppError(
            StatusCodes.NOT_FOUND,
            'You have not enrolled in this course.',
        );
    }
    //check if the course exists or not
    const checkCourse = await Course.findById(course_id);
    if (!checkCourse) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Course not found.');
    }
    //check if the lesson exists or not
    const checkLesson = await Lesson.findById(lesson_id);
    if (!checkLesson) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Lesson not found.');
    }

    //check if the test exists or not
    const checkTest = await Test.findOne({
        _id: test_id,
        lesson_id: lesson_id,
        course_id: course_id,
    });
    if (!checkTest || checkTest.type !== 'MCQ') {
        throw new AppError(StatusCodes.NOT_FOUND, 'MCQ Test not found.');
    }

    //get total score of the test
    const totalScore = checkTest.questionList.length;

    //get the score of the test
    const questions = await Question.find({
        _id: { $in: checkTest.questionList },
    });

    if (!questions || questions.length === 0) {
        throw new AppError(
            StatusCodes.NOT_FOUND,
            'No questions found for this test.',
        );
    }

    let score: number = 0.0;
    let wrongScore = 0;
    let rightScore = 0;

    for (const answer of answers) {
        if (answer.selectedOption === 'null') {
            continue;
        }

        const question = questions.find(
            (q) => q._id.toString() === answer.question_id.toString(),
        );
        if (!question) {
            throw new AppError(StatusCodes.NOT_FOUND, 'Question not found.');
        }
        if (question.correctOption === answer.selectedOption) {
            score += 1.0;
            rightScore += 1;
        } else {
            score -= 0.5;
            wrongScore += 1;
        }
    }
    //check if the student has passed the test or not
    let isPassed = false;
    if (score >= totalScore * 0.4) {
        isPassed = true;
    }

    const data = await TestHistory.create({
        course_id,
        lesson_id,
        test_id,
        student_id: studentDetails._id,
        score: score < 0.0 ? 0.0 : score,
        totalScore,
        rightScore,
        wrongScore,
        answers,
        isPassed,
        timeTaken,
    });

    return data;
};

const createWrittenTestHistory = async (
    userInfo: TJWTDecodedUser,
    payload: any,
): Promise<any> => {
    const { course_id, lesson_id, test_id, answers, timeTaken } = payload;
    // Get student details
    const studentDetails = await Student.findOne({ user_id: userInfo.userId });
    if (!studentDetails) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Student does not exist');
    }
    //check if the student is already have test history for this course
    const checkTestHistory = await TestHistory.findOne({
        test_id,
        student_id: studentDetails._id,
    });
    if (checkTestHistory) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'You have already attempted this test.',
        );
    }

    // Check if student is enrolled in the course
    const checkEnrolled = await EnrolledCourse.findOne({
        course_id: course_id,
        student_id: studentDetails._id,
    });
    if (!checkEnrolled) {
        throw new AppError(
            StatusCodes.NOT_FOUND,
            'You have not enrolled in this course.',
        );
    }
    //check if the course exists or not
    const checkCourse = await Course.findById(course_id);
    if (!checkCourse) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Course not found.');
    }
    //check if the lesson exists or not
    const checkLesson = await Lesson.findById(lesson_id);
    if (!checkLesson) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Lesson not found.');
    }

    //check if the test exists or not
    const checkTest = await Test.findOne({
        _id: test_id,
        lesson_id: lesson_id,
        course_id: course_id,
    });
    if (!checkTest || checkTest.type !== 'Written') {
        throw new AppError(StatusCodes.NOT_FOUND, 'Written Test not found.');
    }

    //get total score of the test
    const totalScore = 0;

    //get the score of the test
    const questions = await Question.find({
        _id: { $in: checkTest.questionList },
    });

    if (!questions || questions.length === 0) {
        throw new AppError(
            StatusCodes.NOT_FOUND,
            'No questions found for this test.',
        );
    }

    let score: number = 0.0;
    let wrongScore = 0;
    let rightScore = 0;

    for (const answer of answers) {
        const question = questions.find(
            (q) => q._id.toString() === answer.question_id.toString(),
        );
        if (!question) {
            throw new AppError(StatusCodes.NOT_FOUND, 'Question not found.');
        }
    }
    let isPassed = false;

    const data = await TestHistory.create({
        course_id,
        lesson_id,
        test_id,
        student_id: studentDetails._id,
        score: score,
        totalScore,
        rightScore,
        wrongScore,
        answers,
        isPassed,
        timeTaken,
    });

    return data;
};

const previewWrittenTestHistory = async (
    userInfo: TJWTDecodedUser,
    payload: any,
): Promise<any> => {
    const { test_id, test_history_id, answers } = payload;

    // Get teacher details
    const teacherDetails = await Teacher.findOne({ user_id: userInfo.userId });
    if (!teacherDetails) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Teacher does not exist');
    }

    //check if the test exists or not
    const checkTest = await Test.findById(test_id);
    if (!checkTest || checkTest.type !== 'Written') {
        throw new AppError(StatusCodes.NOT_FOUND, 'Written Test not found.');
    }

    //check the teacher created the course or not
    const checkCourse = await Course.findById(checkTest.course_id);
    if (!checkCourse) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Course not found.');
    }

    if (checkCourse.teacher_id.toString() !== teacherDetails._id.toString()) {
        throw new AppError(
            StatusCodes.UNAUTHORIZED,
            'You have no access to preview this test history',
        );
    }

    //check test TestHistory
    const testHistory = await TestHistory.findById(test_history_id);
    if (!testHistory) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Test history not found ');
    }
    if (testHistory.test_id.toString() !== test_id.toString()) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'Test history is not for the given test',
        );
    }
    if (testHistory.isChecked === true) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'Test history has already been checked by teacher',
        );
    }

    //get total score of the test
    const totalScore = checkTest.questionList.length;

    //get the score of the test
    const questions = await Question.find({
        _id: { $in: checkTest.questionList },
    });

    if (!questions || questions.length === 0) {
        throw new AppError(
            StatusCodes.NOT_FOUND,
            'No questions found for this test.',
        );
    }

    let score: number = 0.0;
    let wrongScore = 0;
    let rightScore = 0;

    for (const answer of answers) {
        if (answer.selectedOption === 'null') {
            continue;
        }

        const question = questions.find(
            (q) => q._id.toString() === answer.question_id.toString(),
        );
        if (!question) {
            throw new AppError(StatusCodes.NOT_FOUND, 'Question not found.');
        }
        if (answer.mark === 0) {
            wrongScore += 1;
        } else {
            score += answer.mark;
            rightScore += 1;
        }
    }
    //check if the student has passed the test or not
    let isPassed = false;
    if (score >= totalScore * 0.4) {
        isPassed = true;
    }

    const updatedTestHistory = await TestHistory.findByIdAndUpdate(
        test_history_id,
        {
            score: score < 0.0 ? 0.0 : score,
            totalScore,
            rightScore,
            wrongScore,
            answers,
            isPassed,
            isChecked: true,
        },
        { new: true },
    );

    if (!updatedTestHistory) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'Failed to update test history',
        );
    }

    return updatedTestHistory;
};

const getTestHistoryByID = async (
    id: string,
    userInfo: TJWTDecodedUser,
): Promise<any> => {
    // Get student details
    const studentDetails = await Student.findOne({ user_id: userInfo.userId });
    if (!studentDetails) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Student does not exist');
    }
    const data = await TestHistory.findOne({
        test_id: id,
        student_id: studentDetails._id,
    })
        .populate({
            path: 'test_id',
        })
        .populate({
            path: 'answers.question_id',
        });
    if (!data) {
        throw new AppError(
            StatusCodes.NOT_FOUND,
            'TestHistory not found for this student.',
        );
    }

    return data;
};

// const getAllTestHistorys = async (
//     filters: ITestHistoryFilters,
//     paginationOptions: IPaginationOptions,
//     userInfo: TJWTDecodedUser,
// ): Promise<any> => {
//     const { searchTerm, ownTestHistory, date, ...filtersData } = filters;
//     const { page, limit, skip, sortBy, sortOrder } =
//         calculatePagination(paginationOptions);

//     const andConditions = [];
//     if (searchTerm) {
//         andConditions.push({
//             $or: TestHistorySearchableFields.map((field) => ({
//                 [field]: {
//                     $regex: searchTerm,
//                     $options: 'i',
//                 },
//             })),
//         });
//     }
//     //only returns the TestHistory that is created by the requested user
//     if (ownTestHistory === 'true') {
//         andConditions.push({
//             createdBy: new mongoose.Types.ObjectId(userInfo.userId),
//         });
//     }

//     //only return the TestHistory those will be published that date
//     if (date) {
//         const checkDate = new Date(date);
//         if (isNaN(checkDate.getTime())) {
//             throw new AppError(
//                 StatusCodes.NOT_ACCEPTABLE,
//                 'Invalid date format!!!',
//             );
//         }
//         checkDate.setHours(0, 0, 0, 0);

//         andConditions.push({
//             publishDate: {
//                 $gte: checkDate,
//                 $lt: new Date(
//                     checkDate.getFullYear(),
//                     checkDate.getMonth(),
//                     checkDate.getDate() + 1,
//                 ),
//             },
//         });
//     }
//     // filtering data
//     if (Object.keys(filtersData).length) {
//         andConditions.push({
//             $and: Object.entries(filtersData).map(([field, value]) => ({
//                 [field]: value,
//             })),
//         });
//     }

//     const sortConditions: { [key: string]: SortOrder } = {};

//     if (sortBy && sortOrder) {
//         sortConditions[sortBy] = sortOrder;
//     }

//     const whereConditions =
//         andConditions.length > 0 ? { $and: andConditions } : {};

//     const count = await TestHistory.countDocuments(whereConditions);
//     const result = await TestHistory.find(whereConditions)
//         .sort(sortConditions)
//         .skip(skip)
//         .limit(limit)
//         .populate({
//             path: 'course_id',
//         })
//         .populate({
//             path: 'lesson_id',
//         })
//         .populate({
//             path: 'questionList',
//         });

//     return {
//         meta: {
//             page,
//             limit: limit === 0 ? count : limit,
//             count,
//         },
//         data: result,
//     };
// };

// const updateTestHistory = async () => {
//     return 'updateTestHistory service';
// };

// const deleteTestHistoryByID = async (
//     id: string,
//     userInfo: TJWTDecodedUser,
// ): Promise<any> => {
//     const checkUser = await User.findById(userInfo.userId);
//     if (!checkUser) {
//         throw new AppError(StatusCodes.BAD_REQUEST, 'Something went wrong');
//     }

//     const checkTestHistory = await TestHistory.findById(id);
//     if (!checkTestHistory) {
//         throw new AppError(StatusCodes.NOT_FOUND, 'TestHistory not found.');
//     }

//     if (checkUser._id.toString() !== checkTestHistory.createdBy.toString()) {
//         throw new AppError(
//             StatusCodes.UNAUTHORIZED,
//             'You can not delete the TestHistory',
//         );
//     }
//     const data = await TestHistory.findByIdAndDelete(id);
//     if (!data) {
//         throw new AppError(StatusCodes.NOT_FOUND, 'Delete Failed');
//     }

//     return data;
// };

export const TestHistoryService = {
    createTestHistory,
    createWrittenTestHistory,
    previewWrittenTestHistory,
    getTestHistoryByID,
};

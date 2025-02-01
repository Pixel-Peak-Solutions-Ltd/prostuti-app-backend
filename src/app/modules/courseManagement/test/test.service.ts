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
import { uploadToB2 } from '../../../utils/backBlaze';
import config from '../../../config';

const createTest = async (
    userInfo: TJWTDecodedUser,
    payload: any,
    files?: Express.Multer.File[] | undefined,
): Promise<any> => {

    const [course, lesson] = await Promise.all([
        Course.findById(payload.course_id).lean(),
        Lesson.findOne({
            _id: payload.lesson_id,
            course_id: payload.course_id,
        }).lean(),
    ]);

    if (!course) {
        throw new AppError(
            StatusCodes.NOT_FOUND,
            'Course does not exist with this ID',
        );
    }

    if (!lesson) {
        throw new AppError(
            StatusCodes.NOT_FOUND,
            'Lesson does not exist or does not belong to the course',
        );
    }

    // Process files if they exist
    const fileMap: Record<string, any> = {};
    if (files?.length) {
        const uploadedFiles = await Promise.all(
            files.map((file) =>
                uploadToB2(
                    file,
                    config.backblaze_all_users_bucket_name,
                    config.backblaze_all_users_bucket_id,
                    'questionImages',
                ),
            ),
        );

        files.forEach((file, index) => {
            fileMap[file.fieldname] = uploadedFiles[index];
        });
    }

    // Process question list and collect all question IDs
    const questionIds: string[] = [];
    for (let i = 0; i < payload.questionList.length; i++) {
        const item = payload.questionList[i];

        if (item.questionId) {
            const existingQuestion = await Question.findById(item.questionId)
                .select('_id')
                .lean();

            if (!existingQuestion) {
                throw new AppError(
                    StatusCodes.NOT_FOUND,
                    `Question ID ${item.questionId} does not exist`,
                );
            }

            questionIds.push(existingQuestion._id.toString());
        } else if (item.newQuestion) {
            const questionData: any = {
                ...item.newQuestion,
                category_id: course.category_id,
                createdBy: new Types.ObjectId(userInfo.userId),
            };

            // Add image if exists
            const uploadedFile = fileMap[`image${i}`];
            if (uploadedFile) {
                questionData.hasImage = true;
                questionData.image = {
                    diskType: uploadedFile.diskType,
                    path: uploadedFile.path,
                    originalName: uploadedFile.originalName,
                    modifiedName: uploadedFile.modifiedName,
                    fileId: uploadedFile.fileId,
                };
            }

            // Save new question
            const savedQuestion = await Question.create(questionData);
            questionIds.push(savedQuestion._id.toString());
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
        questionList: questionIds,
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

const updateTest = async (
    userInfo: TJWTDecodedUser,
    id: string, // test ID
    payload: any,
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
            'You cannot update this test',
        );
    }

    // Fetch course to get category_id for new questions
    const course = await Course.findById(checkTest.course_id);
    if (!course) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Course not found');
    }

    // Prepare the fields to be updated
    const updateFields: any = {};

    // Update test name if provided
    if (payload.name) {
        updateFields.name = payload.name;
    }

    // Update test time if provided
    if (payload.time) {
        updateFields.time = payload.time;
    }

    // Update test publishDate if provided
    if (payload.publishDate) {
        updateFields.publishDate = new Date(payload.publishDate);
    }

    if (payload.questionList || payload.removeQuestions) {
        // Initialize the updated question list as the current test's question list
        let updatedQuestionList = [...checkTest.questionList];

        // Handle new questions to add to the list
        if (payload.questionList) {
            for (const item of payload.questionList) {
                if (item.questionId) {
                    // Validate existing question ID
                    const existingQuestion = await Question.findById(
                        item.questionId,
                    );
                    if (!existingQuestion) {
                        throw new AppError(
                            StatusCodes.NOT_FOUND,
                            `Question ID ${item.questionId} does not exist.`,
                        );
                    }
                    // Add existing question ID to the list (correcting to ObjectId type)
                    updatedQuestionList.push(
                        new Types.ObjectId(existingQuestion._id.toString()),
                    );
                } else if (item.newQuestion) {
                    // Create new question with category_id from the course
                    const newQuestion = new Question({
                        ...item.newQuestion,
                        category_id: course.category_id, // Use category_id from the course
                        createdBy: new Types.ObjectId(userInfo.userId),
                    });
                    const savedQuestion = await newQuestion.save();
                    // Add new question ID to the list
                    updatedQuestionList.push(
                        new Types.ObjectId(savedQuestion._id.toString()),
                    );
                }
            }
        }

        // Handle removing questions if provided
        if (payload.removeQuestions && payload.removeQuestions.length > 0) {
            // Remove questions from the test's current question list
            updatedQuestionList = updatedQuestionList.filter(
                (id: any) => !payload.removeQuestions.includes(id),
            );
        }

        // Add updated question list to the fields to be updated
        updateFields.questionList = updatedQuestionList;
    }

    // Update the test
    const updatedTest = await Test.findByIdAndUpdate(id, updateFields, {
        new: true,
        runValidators: true,
    });

    if (!updatedTest) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to update test');
    }

    return updatedTest;
};

//mark Test as completed

const markTestAsCompleted = async (testId: string) => {
    // Check if the Test exists
    const existingTest = await Test.findById(testId);
    if (!existingTest) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Test not found');
    }

    const markAsCompeted = await Test.findByIdAndUpdate(
        testId,
        { isCompleted: true },
        { new: true },
    );

    return markAsCompeted;
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
    markTestAsCompleted,
};

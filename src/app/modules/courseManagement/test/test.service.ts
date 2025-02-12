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
import { ICourse } from '../course/course.interface';

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
            if (uploadedFiles[index]) {
                fileMap[file.fieldname] = uploadedFiles[index];
            }
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
    files: Express.Multer.File[] | undefined,
): Promise<any> => {
    const [checkUser, checkTest] = await Promise.all([
        User.findById(userInfo.userId).lean(),
        Test.findById(id).lean(),
    ]);

    if (!checkUser) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'User not found');
    }

    if (!checkTest) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Test not found');
    }

    if (checkUser._id.toString() !== checkTest.createdBy.toString()) {
        throw new AppError(
            StatusCodes.UNAUTHORIZED,
            'You cannot update this test',
        );
    }

    // Fetch course only if we need to add new questions.we need category_id from course
    let course: ICourse | null;
    if (payload.questionList?.some((item: any) => item.newQuestion)) {
        course = await Course.findById(checkTest.course_id).lean();
        if (!course) {
            throw new AppError(StatusCodes.NOT_FOUND, 'Course not found');
        }
    }

    // Handle file uploads
    const uploadedFiles = files?.length
        ? await Promise.all(
              files.map((file) =>
                  uploadToB2(
                      file,
                      config.backblaze_all_users_bucket_name,
                      config.backblaze_all_users_bucket_id,
                      'questionImages',
                  ),
              ),
          )
        : [];

    // Create file mappingggg
    const uploadedFileMap = uploadedFiles.reduce(
        (acc, file, index) => {
            if (files) {
                acc[`image${index}`] = file;
            }
            return acc;
        },
        {} as Record<string, any>,
    );

    // Prepare update fields
    const updateFields: Record<string, any> = {
        ...(payload.name && { name: payload.name }),
        ...(payload.time && { time: payload.time }),
        ...(payload.publishDate && {
            publishDate: new Date(payload.publishDate),
        }),
        // ...(uploadedFile && {
        //     image: {
        //         diskType: uploadedFile.diskType,
        //         path: uploadedFile.path,
        //         originalName: uploadedFile.originalName,
        //         modifiedName: uploadedFile.modifiedName,
        //         fileId: uploadedFile.fileId
        //     }
        // })
    };

    // Handle question list updates
    if (payload.questionList || payload.removeQuestions) {
        let updatedQuestionList = [...checkTest.questionList];

        // Process new questions
        if (payload.questionList?.length) {
            const newQuestionIds = await Promise.all(
                payload.questionList.map(async (item:any,index:any) => {
                    if (item.questionId) {
                        const existingQuestion = await Question.findById(
                            item.questionId,
                        ).lean();
                        if (!existingQuestion) {
                            throw new AppError(
                                StatusCodes.NOT_FOUND,
                                `Question ID ${item.questionId} does not exist`,
                            );
                        }
                        return new Types.ObjectId(existingQuestion._id);
                    } else if (item.newQuestion && course) {
                        const questionData: any = {
                            ...item.newQuestion,
                            category_id: course.category_id,
                            createdBy: new Types.ObjectId(userInfo.userId)
                        };

                        // Add image if exists for this question
                        const uploadedFile = uploadedFileMap[`image${index}`];
                        if (uploadedFile) {
                            questionData.hasImage = true;
                            questionData.image = {
                                diskType: uploadedFile.diskType,
                                path: uploadedFile.path,
                                originalName: uploadedFile.originalName,
                                modifiedName: uploadedFile.modifiedName,
                                fileId: uploadedFile.fileId
                            };
                        }
                        const savedQuestion = await Question.create(questionData);
                        return new Types.ObjectId(savedQuestion._id);
                    }
                }),
            );

            updatedQuestionList = [
                ...updatedQuestionList,
                ...newQuestionIds.filter(Boolean),
            ];
        }

        // Remove questions if specified
        if (payload.removeQuestions?.length) {
            updatedQuestionList = updatedQuestionList.filter(
                (id) => !payload.removeQuestions?.includes(id.toString()),
            );
        }

        updateFields.questionList = updatedQuestionList;
    }

    // Update test
    const updatedTest = await Test.findByIdAndUpdate(id, updateFields, {
        new: true,
        runValidators: true,
    }).lean();

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

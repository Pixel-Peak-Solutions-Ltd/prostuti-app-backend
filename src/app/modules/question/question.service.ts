import { StatusCodes } from 'http-status-codes';
import mongoose, { PipelineStage, Types } from 'mongoose';
import AppError from '../../classes/errorClasses/AppError';
import { calculatePagination } from '../../helpers/pagenationHelper';
import { IPaginationOptions } from '../../interfaces/common';
import { TJWTDecodedUser } from '../../interfaces/jwt/jwt.type';
import { Category } from '../category/category.model';
import { User } from '../user/user.model';
import { QuestionSearchableFields } from './question.constant';
import { IQuestion, IQuestionFilters } from './question.interface';
import { Question } from './question.model';
import { uploadToB2 } from '../../utils/backBlaze';
import config from '../../config';

const createQuestion = async (
    userInfo: TJWTDecodedUser,
    payload: Partial<IQuestion>[],
    files?: Express.Multer.File[] | undefined,
): Promise<any> => {
    if (!Array.isArray(payload) || payload.length === 0) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'No questions provided');
    }
    const categoryId = payload[0].category_id;
    const category = await Category.findById(categoryId).lean();
    if (!category) {
        throw new AppError(
            StatusCodes.NOT_FOUND,
            `Category not found for category_id: ${categoryId}`,
        );
    }
    try {
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

        // Create file mapping
        const uploadedFileMap = uploadedFiles.reduce(
            (acc, file, index) => {
                if (files) {
                    acc[`image${index}`] = file;
                }
                return acc;
            },
            {} as Record<string, any>,
        );

        // Prepare questions
        const questionsToCreate = payload.map((question, index) => {
            const baseQuestion: Partial<IQuestion> = {
                type: question.type,
                title: question.title,
                description: question.description,
                category_id: category._id,
                createdBy: new Types.ObjectId(userInfo.userId),
            };

            // Add MCQ specific fields
            if (question.type === 'MCQ') {
                baseQuestion.options = question.options;
                baseQuestion.correctOption = question.correctOption;
            }

            // Add image if exists
            const uploadedFile = uploadedFileMap[`image${index}`];
            if (uploadedFile) {
                baseQuestion.hasImage = true;
                baseQuestion.image = {
                    diskType: uploadedFile.diskType,
                    path: uploadedFile.path,
                    originalName: uploadedFile.originalName,
                    modifiedName: uploadedFile.modifiedName,
                    fileId: uploadedFile.fileId,
                };
            }

            return baseQuestion;
        });

        // Create questions in database
        return await Question.create(questionsToCreate);
    } catch (error) {
        throw new AppError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            error instanceof Error
                ? error.message
                : 'Failed to create questions',
        );
    }
};

const getAllQuestions = async (
    filters: IQuestionFilters,
    paginationOptions: IPaginationOptions,
    userInfo: TJWTDecodedUser,
): Promise<any> => {
    const { searchTerm, ownQuestion, ...filtersData } = filters;
    const { page, limit, skip, sortBy, sortOrder } =
        calculatePagination(paginationOptions);

    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            $or: QuestionSearchableFields.map((field) => ({
                [field]: {
                    $regex: searchTerm,
                    $options: 'i',
                },
            })),
        });
    }

    if (ownQuestion === 'true') {
        andConditions.push({
            createdBy: new mongoose.Types.ObjectId(userInfo.userId),
        });
    }
    // filtering data
    if (Object.keys(filtersData).length) {
        andConditions.push({
            $and: Object.entries(filtersData).map(([field, value]) => {
                if (field === 'type') {
                    return { [field]: value };
                } else if (field === 'categoryType') {
                    return { 'category.type': value };
                } else {
                    return { [`category.${field}`]: value };
                }
            }),
        });
    }

    type SortOrder = 1 | -1;
    const sortConditions: { [key: string]: SortOrder } = {};

    if (sortBy && sortOrder) {
        sortConditions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    const whereConditions =
        andConditions.length > 0 ? { $and: andConditions } : {};

    const pipeline: PipelineStage[] = [
        {
            $lookup: {
                from: 'categories',
                localField: 'category_id',
                foreignField: '_id',
                as: 'category',
            },
        },
        {
            $match: whereConditions,
        },
        {
            $sort: sortConditions,
        },
        {
            $skip: skip,
        },
    ];
    if (limit > 0) {
        pipeline.push({ $limit: limit });
    }

    const result = await Question.aggregate(pipeline);

    return {
        meta: {
            page,
            limit: limit === 0 ? result.length : limit,
            count: result.length,
        },
        data: result,
    };
};

const getQuestionByID = async (id: string): Promise<any> => {
    const data = await Question.findById(id)
        .populate('category_id')
        .populate('createdBy')
        .populate('updatedBy');
    if (!data) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Question not found');
    }
    return data;
};

const updateQuestion = async (
    userInfo: TJWTDecodedUser,
    id: string,
    payload: Partial<IQuestion>,
    file: Express.Multer.File,
): Promise<any> => {
    const checkUser = await User.findById(userInfo.userId);
    if (!checkUser) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Something went wrong');
    }

    const checkQuestion = await Question.findById(id);
    if (!checkQuestion) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Question not found.');
    }

    if (checkUser._id.toString() !== checkQuestion.createdBy.toString()) {
        throw new AppError(
            StatusCodes.UNAUTHORIZED,
            'You can not update this question',
        );
    }
    // Handle file upload if provided
    let uploadedFile;
    if (file) {
        uploadedFile = await uploadToB2(
            file,
            config.backblaze_all_users_bucket_name,
            config.backblaze_all_users_bucket_id,
            'questionImages',
        );
    }
    
    // Find and update the question
    const updatedQuestion = await Question.findByIdAndUpdate(
        id,
        {
            ...(payload.title && { title: payload.title }),
            ...(payload.description && { description: payload.description }),
            ...(payload.options && { options: payload.options }),
            ...(payload.correctOption && {
                correctOption: payload.correctOption,
            }),
            ...(uploadedFile && {
                hasImage: true,
                image: {
                    diskType: uploadedFile.diskType,
                    path: uploadedFile.path,
                    originalName: uploadedFile.originalName,
                    modifiedName: uploadedFile.modifiedName,
                    fileId: uploadedFile.fileId,
                },
            }),
        },
        { new: true, runValidators: true },
    );

    if (!updatedQuestion) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'Failed to update question',
        );
    }
    return updatedQuestion;
};

const deleteQuestionByID = async (
    userInfo: TJWTDecodedUser,
    id: string,
): Promise<any> => {
    const checkUser = await User.findById(userInfo.userId);
    if (!checkUser) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Something went wrong');
    }

    const checkQuestion = await Question.findById(id);
    if (!checkQuestion) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Question not found.');
    }

    if (checkUser._id.toString() !== checkQuestion.createdBy.toString()) {
        throw new AppError(StatusCodes.UNAUTHORIZED, 'You can not delete it');
    }
    const data = await Question.findByIdAndDelete(id);
    if (!data) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Delete Failed');
    }

    return data;
};

export const QuestionService = {
    createQuestion,
    getAllQuestions,
    getQuestionByID,
    updateQuestion,
    deleteQuestionByID,
};

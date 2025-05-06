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
import { Teacher } from '../teacher/teacher.model';

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
        const uploadedFileMap = files?.reduce((acc, file, index) => {
            if (uploadedFiles[index]) {
                acc[file.fieldname] = uploadedFiles[index];
            }
            return acc;
        }, {} as Record<string, any>) ?? {};

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

    if (userInfo.role === 'teacher') {
        // Teachers can see their own pending/rejected questions
        const teacher = await Teacher.findOne({ user_id: userInfo.userId });

        if (teacher && teacher.assignedWorks.includes('ProofChecker')) {
            // ProofCheckers can see all questions
        } else {
            // Regular teachers can only see approved questions and their own
            andConditions.push({
                $or: [
                    { approvalStatus: 'approved' },
                    { createdBy: new mongoose.Types.ObjectId(userInfo.userId) }
                ]
            });
        }
    } else {
        // Non-teachers can only see approved questions
        andConditions.push({ approvalStatus: 'approved' });
    }

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

const approveQuestion = async (
    userInfo: TJWTDecodedUser,
    id: string,
): Promise<any> => {
    // Check if user exists and has ProofChecker role
    const user = await User.findById(userInfo.userId);
    if (!user) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'User not found');
    }

    // Find the teacher to check for ProofChecker role
    const teacher = await Teacher.findOne({ user_id: userInfo.userId });
    if (!teacher) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Teacher not found');
    }

    if (!teacher.assignedWorks.includes('ProofChecker')) {
        throw new AppError(
            StatusCodes.FORBIDDEN,
            'You do not have permission to approve questions',
        );
    }

    // Find the question
    const question = await Question.findById(id);
    if (!question) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Question not found');
    }

    // Check if question is already approved or rejected
    if (question.approvalStatus !== 'pending') {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            `Question is already ${question.approvalStatus}`,
        );
    }

    // Ensure approver is not the creator
    if (question.createdBy.toString() === userInfo.userId) {
        throw new AppError(
            StatusCodes.FORBIDDEN,
            'You cannot approve your own question',
        );
    }

    // Update the question
    const updatedQuestion = await Question.findByIdAndUpdate(
        id,
        {
            approvalStatus: 'approved',
            approvedBy: userInfo.userId,
            approvedAt: new Date(),
        },
        { new: true, runValidators: true },
    ).populate('category_id')
        .populate('createdBy')
        .populate('approvedBy');

    return updatedQuestion;
};

const rejectQuestion = async (
    userInfo: TJWTDecodedUser,
    id: string,
    rejectionReason: string,
): Promise<any> => {
    // Check if user exists and has ProofChecker role
    const user = await User.findById(userInfo.userId);
    if (!user) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'User not found');
    }

    // Find the teacher to check for ProofChecker role
    const teacher = await Teacher.findOne({ user_id: userInfo.userId });
    if (!teacher) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Teacher not found');
    }

    if (!teacher.assignedWorks.includes('ProofChecker')) {
        throw new AppError(
            StatusCodes.FORBIDDEN,
            'You do not have permission to reject questions',
        );
    }

    // Find the question
    const question = await Question.findById(id);
    if (!question) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Question not found');
    }

    // Check if question is already approved or rejected
    if (question.approvalStatus !== 'pending') {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            `Question is already ${question.approvalStatus}`,
        );
    }

    // Ensure rejector is not the creator
    if (question.createdBy.toString() === userInfo.userId) {
        throw new AppError(
            StatusCodes.FORBIDDEN,
            'You cannot reject your own question',
        );
    }

    // Update the question
    const updatedQuestion = await Question.findByIdAndUpdate(
        id,
        {
            approvalStatus: 'rejected',
            approvedBy: userInfo.userId,
            approvedAt: new Date(),
            rejectionReason,
        },
        { new: true, runValidators: true },
    ).populate('category_id')
        .populate('createdBy')
        .populate('approvedBy');

    return updatedQuestion;
};

// src/app/modules/question/question.service.ts

const getPendingQuestions = async (
    filters: IQuestionFilters,
    paginationOptions: IPaginationOptions,
): Promise<any> => {
    const { searchTerm, ...filtersData } = filters;
    const { page, limit, skip, sortBy, sortOrder } =
        calculatePagination(paginationOptions);

    // Start with the required condition for pending questions
    const andConditions = [{ approvalStatus: 'pending' }];

    // Add search term condition if provided
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

    // Add other filter conditions
    if (Object.keys(filtersData).length) {
        andConditions.push({
            $and: Object.entries(filtersData).map(([field, value]) => {
                if (field === 'type') {
                    return { [field]: value };
                } else if (field === 'categoryType') {
                    return { 'category.type': value };
                } else if (field === 'ownQuestion') {
                    // Skip this filter for pending questions endpoint
                    return {};
                } else if (field === 'hasImage') {
                    return { [field]: value === 'true' };
                } else {
                    return { [`category.${field}`]: value };
                }
            }),
        });
    }

    // Set up sorting conditions
    const sortConditions: { [key: string]: SortOrder } = {};

    if (sortBy && sortOrder) {
        sortConditions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    } else {
        // Default sort by creation date, newest first
        sortConditions['createdAt'] = -1;
    }

    // Build the query with all conditions
    const whereConditions =
        andConditions.length > 0 ? { $and: andConditions } : {};

    // Create the pipeline for aggregation
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
            $lookup: {
                from: 'users',
                localField: 'createdBy',
                foreignField: '_id',
                as: 'creator',
            },
        },
        {
            $addFields: {
                creator: { $arrayElemAt: ['$creator', 0] },
                category: { $arrayElemAt: ['$category', 0] },
            }
        },
        {
            $match: whereConditions,
        },
        {
            $sort: sortConditions,
        },
        {
            $skip: skip,
        }
    ];

    // Add limit stage if not retrieving all
    if (limit > 0) {
        pipeline.push({ $limit: limit });
    }

    // Count total matching questions
    const countPipeline = [
        ...pipeline.slice(0, pipeline.findIndex(stage => '$skip' in stage)),
        { $count: 'total' }
    ];

    const countResult = await Question.aggregate(countPipeline);
    const count = countResult.length > 0 ? countResult[0].total : 0;

    // Execute the main query
    const result = await Question.aggregate(pipeline);

    // Format the response with appropriate metadata
    return {
        meta: {
            page,
            limit: limit === 0 ? count : limit,
            count,
        },
        data: result.map(question => ({
            ...question,
            creator: {
                _id: question.creator?._id,
                name: question.creator?.name
            },
            category: {
                _id: question.category?._id,
                subject: question.category?.subject,
                type: question.category?.type
            }
        })),
    };
};

export const QuestionService = {
    createQuestion,
    getAllQuestions,
    getQuestionByID,
    updateQuestion,
    deleteQuestionByID,
    getPendingQuestions,
    approveQuestion,
    rejectQuestion,
};

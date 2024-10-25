import { StatusCodes } from 'http-status-codes';
import AppError from '../../classes/errorClasses/AppError';
import { IPaginationOptions } from '../../interfaces/common';
import { TJWTDecodedUser } from '../../interfaces/jwt/jwt.type';
import { User } from '../user/user.model';
import { ICategory, ICategoryFilters } from './category.interface';
import { USER_STATUS } from '../user/user.constant';
import { calculatePagination } from '../../helpers/pagenationHelper';
import { categorySearchableFields, categoryType } from './category.constant';
import { SortOrder } from 'mongoose';
import { Category } from './category.model';

const createCategory = async (
    userInfo: TJWTDecodedUser,
    payload: Partial<ICategory>,
): Promise<any> => {
    //check user
    const checkUser = await User.findById(userInfo.registeredId);
    if (!checkUser) {
        throw new AppError(StatusCodes.NOT_FOUND, 'User is not found');
    }
    // Check if the user is already deleted
    if (checkUser.isDeleted) {
        throw new AppError(StatusCodes.FORBIDDEN, 'User is deleted');
    }
    // Check if the user is blocked
    if (checkUser.status === USER_STATUS.blocked) {
        throw new AppError(StatusCodes.FORBIDDEN, 'User is blocked');
    }

    let newCategory: Partial<ICategory>;

    if (payload.type === 'Academic') {
        newCategory = {
            type: payload.type,
            division: payload.division,
            subject: payload.subject,
            ...(payload.chapter && { chapter: payload.chapter }),
        };
    } else if (payload.type === 'Admission') {
        newCategory = {
            type: payload.type,
            universityType: payload.universityType,
            universityName: payload.universityName,
            ...(payload.unit && { unit: payload.unit }),
            subject: payload.subject,
        };
    } else {
        newCategory = {
            type: payload.type,
            subject: payload.subject,
        };
    }

    const data = await Category.create(newCategory);
    return data;
};

const getAllCategories = async (
    filters: ICategoryFilters,
    paginationOptions: IPaginationOptions,
    userInfo: TJWTDecodedUser,
): Promise<{ meta: any; data: any[] }> => {
    const { searchTerm, ...filtersData } = filters;

    const checkUser = await User.findById(userInfo.registeredId);
    if (!checkUser) {
        throw new AppError(StatusCodes.NOT_FOUND, 'User is not found');
    }
    // Check if the user is already deleted
    if (checkUser.isDeleted) {
        throw new AppError(StatusCodes.FORBIDDEN, 'User is deleted');
    }
    // Check if the user is blocked
    if (checkUser.status === USER_STATUS.blocked) {
        throw new AppError(StatusCodes.FORBIDDEN, 'User is blocked');
    }

    const { page, limit, skip, sortBy, sortOrder } =
        calculatePagination(paginationOptions);

    const andConditions = [];

    // searching data
    if (searchTerm) {
        andConditions.push({
            $or: categorySearchableFields.map((field) => ({
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

    const count = await Category.countDocuments(whereConditions);
    const result = await Category.find(whereConditions)
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

const getCategoryByID = async (
    id: string,
    userInfo: TJWTDecodedUser,
): Promise<any> => {
    const checkUser = await User.findById(userInfo.registeredId);
    if (!checkUser) {
        throw new AppError(StatusCodes.NOT_FOUND, 'User is not found');
    }
    // Check if the user is already deleted
    if (checkUser.isDeleted) {
        throw new AppError(StatusCodes.FORBIDDEN, 'User is deleted');
    }
    // Check if the user is blocked
    if (checkUser.status === USER_STATUS.blocked) {
        throw new AppError(StatusCodes.FORBIDDEN, 'User is blocked');
    }

    const data = await Category.findById(id);
    return data;
};

const updateCategory = async (
    id: string,
    userInfo: TJWTDecodedUser,
    payload: Partial<ICategory>,
): Promise<any> => {
    const {
        type,
        division,
        subject,
        chapter,
        universityType,
        universityName,
        unit,
    } = payload;

    //check user
    const checkUser = await User.findById(userInfo.registeredId);
    if (!checkUser) {
        throw new AppError(StatusCodes.NOT_FOUND, 'User is not found');
    }
    // Check if the user is already deleted
    if (checkUser.isDeleted) {
        throw new AppError(StatusCodes.FORBIDDEN, 'User is deleted');
    }
    // Check if the user is blocked
    if (checkUser.status === USER_STATUS.blocked) {
        throw new AppError(StatusCodes.FORBIDDEN, 'User is blocked');
    }

    // Check if the category exists
    const category = await Category.findById(id);
    if (!category) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Category not found.');
    }

    // Prepare the update data
    const updateData: Partial<ICategory> = {};
    if (type) updateData.type = type;
    if (division) updateData.division = division;
    if (subject) updateData.subject = subject;
    if (chapter) updateData.chapter = chapter;
    if (universityType) updateData.universityType = universityType;
    if (universityName) updateData.universityName = universityName;
    if (unit) updateData.unit = unit;

    const updatedCategory = await Category.findByIdAndUpdate(id, updateData, {
        new: true,
    });
    return updatedCategory;
};

const deleteCategoryByID = async (
    id: string,
    userInfo: TJWTDecodedUser,
): Promise<any> => {
    const checkUser = await User.findById(userInfo.registeredId);
    if (!checkUser) {
        throw new AppError(StatusCodes.NOT_FOUND, 'User is not found');
    }
    // Check if the user is already deleted
    if (checkUser.isDeleted) {
        throw new AppError(StatusCodes.FORBIDDEN, 'User is deleted');
    }
    // Check if the user is blocked
    if (checkUser.status === USER_STATUS.blocked) {
        throw new AppError(StatusCodes.FORBIDDEN, 'User is blocked');
    }

    const data = await Category.findByIdAndDelete(id);
    return data;
};

export const CategoryService = {
    createCategory,
    getAllCategories,
    getCategoryByID,
    updateCategory,
    deleteCategoryByID,
};

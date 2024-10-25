import { StatusCodes } from 'http-status-codes';
import AppError from '../../classes/errorClasses/AppError';
import { IPaginationOptions } from '../../interfaces/common';
import { TJWTDecodedUser } from '../../interfaces/jwt/jwt.type';
import { User } from '../user/user.model';
import { ICategoryFilters } from './category.interface';
import { USER_STATUS } from '../user/user.constant';
import { calculatePagination } from '../../helpers/pagenationHelper';
import { categorySearchableFields } from './category.constant';
import { SortOrder } from 'mongoose';
import { Category } from './category.model';

const createCategory = async () => {
    return 'createCategory service';
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

const updateCategory = async () => {
    return 'updateCategory service';
};

const deleteCategoryByID = async () => {
    return 'deleteCategoryByID service';
};

export const CategoryService = {
    createCategory,
    getAllCategories,
    getCategoryByID,
    updateCategory,
    deleteCategoryByID,
};

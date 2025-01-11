import { StatusCodes } from 'http-status-codes';
import AppError from '../../classes/errorClasses/AppError';
import { calculatePagination } from '../../helpers/pagenationHelper';
import { IPaginationOptions } from '../../interfaces/common';
import { SubscriptionSearchableFields } from './subscription.constant';
import { ISubscriptionFilters } from './subscription.interface';
import { Subscription } from './subscription.model';
import { SortOrder } from 'mongoose';

const getAllSubscriptions = async (
    filters: ISubscriptionFilters,
    paginationOptions: IPaginationOptions,
): Promise<any> => {
    const { searchTerm, startDate, endDate, price, ...filtersData } = filters;
    const { page, limit, skip, sortBy, sortOrder } =
        calculatePagination(paginationOptions);

    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            $or: SubscriptionSearchableFields.map((field) => ({
                [field]: {
                    $regex: searchTerm,
                    $options: 'i',
                },
            })),
        });
    }

    if (startDate) {
        const checkDate = new Date(startDate);
        if (isNaN(checkDate.getTime())) {
            throw new AppError(
                StatusCodes.NOT_ACCEPTABLE,
                'Invalid date format!!!',
            );
        }
        checkDate.setHours(0, 0, 0, 0);

        andConditions.push({
            startDate: {
                $gte: checkDate,
                $lt: new Date(
                    checkDate.getFullYear(),
                    checkDate.getMonth(),
                    checkDate.getDate() + 1,
                ),
            },
        });
    }
    if (endDate) {
        const checkDate = new Date(endDate);
        if (isNaN(checkDate.getTime())) {
            throw new AppError(
                StatusCodes.NOT_ACCEPTABLE,
                'Invalid date format!!!',
            );
        }
        checkDate.setHours(0, 0, 0, 0);

        andConditions.push({
            expireDate: {
                $gte: checkDate,
                $lt: new Date(
                    checkDate.getFullYear(),
                    checkDate.getMonth(),
                    checkDate.getDate() + 1,
                ),
            },
        });
    }
    if (price) {
        const parsedPrice = Number(price);
        if (isNaN(parsedPrice)) {
            throw new AppError(
                StatusCodes.NOT_ACCEPTABLE,
                'Invalid amount value!',
            );
        }
        andConditions.push({
            price: { $lte: parsedPrice },
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

    const count = await Subscription.countDocuments(whereConditions);
    const result = await Subscription.find(whereConditions)
        .sort(sortConditions)
        .skip(skip)
        .limit(limit)
        .populate({
            path: 'student_id',
        })
        .populate({ path: 'payment_id' });

    return {
        meta: {
            page,
            limit: limit === 0 ? count : limit,
            count,
        },
        data: result,
    };
};

const getSubscriptionByID = async (id: string): Promise<any> => {
    const data = await Subscription.findById(id)
        .populate('student_id')
        .populate('payment_id');

    if (!data) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Subscription not found');
    }
    return data;
};

export const SubscriptionService = {
    getAllSubscriptions,
    getSubscriptionByID,
};

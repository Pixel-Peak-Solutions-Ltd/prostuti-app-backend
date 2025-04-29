import { SortOrder } from 'mongoose';
import { calculatePagination } from '../../helpers/pagenationHelper';
import { IPaginationOptions } from '../../interfaces/common';
import { ILeaderBoardFilters } from './leaderboard.interface';
import { LeaderBoard } from './leaderboard.model';
import { leaderBoardSearchableFields } from './leaderboard.constant';

const getGlobalLeaderBoard = async (
    filters: ILeaderBoardFilters,
    paginationOptions: IPaginationOptions,
) => {
    const { searchTerm, ...filtersData } = filters;
    const { page, limit, skip, sortBy, sortOrder } =
        calculatePagination(paginationOptions);
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            $or: leaderBoardSearchableFields.map((field) => ({
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
    } else {
        sortConditions['totalScore'] = -1;
    }

    const whereConditions =
        andConditions.length > 0 ? { $and: andConditions } : {};

    const count = await LeaderBoard.countDocuments(whereConditions);
    const result = await LeaderBoard.find({
        course_id: null,
        ...whereConditions,
    })
        .populate('student_id')
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
const getCourseLeaderBoard = async (
    courseId: string,
    filters: ILeaderBoardFilters,
    paginationOptions: IPaginationOptions,
) => {
    const { searchTerm, ...filtersData } = filters;
    const { page, limit, skip, sortBy, sortOrder } =
        calculatePagination(paginationOptions);
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            $or: leaderBoardSearchableFields.map((field) => ({
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
    } else {
        sortConditions['totalScore'] = -1;
    }

    const whereConditions =
        andConditions.length > 0 ? { $and: andConditions } : {};

    const count = await LeaderBoard.countDocuments(whereConditions);
    const result = await LeaderBoard.find({
        course_id: courseId,
        ...whereConditions,
    })
        .populate('student_id')
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

export const LeaderBoardService = {
    getGlobalLeaderBoard,
    getCourseLeaderBoard,
};

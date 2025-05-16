import { SortOrder } from 'mongoose';
import { calculatePagination } from '../../helpers/pagenationHelper';
import { IPaginationOptions } from '../../interfaces/common';
import { TJWTDecodedUser } from '../../interfaces/jwt/jwt.type';
import { teacherLogSearchableFields } from './teacherLog.constant';
import { ITeacherLogFilters } from './teacherLog.interface';
import { TeacherLog } from './teacherLog.model';
import { Teacher } from '../teacher/teacher.model';
import AppError from '../../classes/errorClasses/AppError';
import { StatusCodes } from 'http-status-codes';

const getAllTeacherLogs = async (
    filters: ITeacherLogFilters,
    paginationOptions: IPaginationOptions,
    userInfo: TJWTDecodedUser,
) => {
    const { searchTerm, ...filtersData } = filters;
    const { page, limit, skip, sortBy, sortOrder } =
        calculatePagination(paginationOptions);

    const andConditions = [];

    if (searchTerm) {
        andConditions.push({
            $or: teacherLogSearchableFields.map((field) => ({
                [field]: {
                    $regex: searchTerm,
                    $options: 'i',
                },
            })),
        });
    }

    // Role-based access control
    if (userInfo.role === 'teacher') {
        //check teacher
        const checkTeacher=await Teacher.findOne({user_id:userInfo.userId})
        if(!checkTeacher){
            throw new AppError(StatusCodes.NOT_FOUND, 'teacher is not found');
        }

        // Check if teacher_id filter is provided and matches the user's teacher_id
    if (filtersData.teacher_id && filtersData.teacher_id !== checkTeacher._id.toString()) {
        throw new AppError(
          StatusCodes.FORBIDDEN,
          'You cannot view other teachers\' logs'
        );
      }
        // Teachers can only see their own logs
        andConditions.push({ teacher_id: checkTeacher.id });
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

    const count = await TeacherLog.countDocuments(whereConditions);
    const result = await TeacherLog.find(whereConditions)
        .sort(sortConditions)
        .skip(skip)
        .limit(limit)
        .populate({
            path: 'teacher_id',
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

export const TeacherLogsService = {
    getAllTeacherLogs,
};

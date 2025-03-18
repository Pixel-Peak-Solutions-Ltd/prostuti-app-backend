/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { StatusCodes } from 'http-status-codes';
import AppError from '../../classes/errorClasses/AppError';
import { Course } from '../courseManagement/course/course.model';
import { Teacher } from '../teacher/teacher.model';
import { teacherManagementSearchableFields } from './teacherManagemen.constant';
import QueryBuilder from './teacherManagementQueryBuilder';

// Get All Teachers
const getAllTeacher = async (query: Record<string, unknown>) => {
    const teacherManagementQuery = new QueryBuilder(Teacher.find(), query)
        .search(teacherManagementSearchableFields)
        .filter()
        .sort()
        .fields();

    const teacher = await teacherManagementQuery.modelQuery;

    return teacher;
};

// Get A Teacher
const getTeacherInformation = async (teacherId: string) => {
    const teacher = await Teacher.findOne({ teacherId });

    if (!teacher) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Teacher is not found');
    }

    const course = await Course.find({ teacher_id: teacher.user_id });

    return { teacher, courses: course };
};

export const teacherManagementService = {
    getAllTeacher,
    getTeacherInformation,
};

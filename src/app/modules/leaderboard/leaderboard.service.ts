import { SortOrder } from 'mongoose';
import { calculatePagination } from '../../helpers/pagenationHelper';
import { IPaginationOptions } from '../../interfaces/common';
import {
    ILeaderBoardFilters,
    PopulatedAssignment,
    PopulatedTest,
} from './leaderboard.interface';
import { LeaderBoard } from './leaderboard.model';
import { leaderBoardSearchableFields } from './leaderboard.constant';
import { Course } from '../courseManagement/course/course.model';
import AppError from '../../classes/errorClasses/AppError';
import { StatusCodes } from 'http-status-codes';
import { Student } from '../student/student.model';
import { AssignmentSubmission } from '../assignmentSubmission/assignmentSubmission.model';
import { TestHistory } from '../courseManagement/test-history/testHistory.model';

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

const getStudentAllAssignmentTestOfACourse = async (
    courseId: string,
    studentId: string,
) => {
    const [course, student] = await Promise.all([
        Course.findById(courseId).select('_id'),
        Student.findById(studentId).select('name'),
    ]);

    if (!course) throw new AppError(StatusCodes.NOT_FOUND, 'Course not found');
    if (!student)
        throw new AppError(StatusCodes.NOT_FOUND, 'Student not found');

    const [assignmentsRaw, testsRaw] = await Promise.all([
        AssignmentSubmission.find({
            course_id: courseId,
            studentProfile_id: studentId,
        })
            .populate({
                path: 'assignment_id',
                select: 'assignmentNo marks',
            })
            .populate({
                path: 'studentProfile_id',
                select: 'name',
            })
            .select('assignment_id studentProfile_id givenMark'),

        TestHistory.find({
            course_id: courseId,
            student_id: studentId,
        })
            .populate({
                path: 'test_id',
                select: 'name',
            })
            .populate({
                path: 'student_id',
                select: 'name',
            })
            .select('test_id student_id totalScore score'),
    ]);

    const assignments = assignmentsRaw as unknown as PopulatedAssignment[];
    const tests = testsRaw as unknown as PopulatedTest[];

    const statistics = [
        ...assignments.map((a) => ({
            _id: a._id,
            studentName: a.studentProfile_id.name,
            title: a.assignment_id?.assignmentNo ?? 'Untitled Assignment',
            totalMarks: a.assignment_id.marks.toString(),
            studentMarks: a.givenMark.toString(),
        })),
        ...tests.map((t) => ({
            _id: t._id,
            studentName: t.student_id.name,
            title: t.test_id?.name ?? 'Untitled Test',
            totalMarks: t.totalScore.toString(),
            studentMarks: t.score.toString(),
        })),
    ];

    return statistics;
};

export const LeaderBoardService = {
    getGlobalLeaderBoard,
    getCourseLeaderBoard,
    getStudentAllAssignmentTestOfACourse,
};

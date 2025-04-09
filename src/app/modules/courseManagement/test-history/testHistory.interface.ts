import { Model, Types } from 'mongoose';

export type ITestHistory = {
    course_id: Types.ObjectId;
    lesson_id: Types.ObjectId;
    test_id: Types.ObjectId;
    student_id: Types.ObjectId;
    attemptedAt: Date;
    score: number;
    totalScore: number;
    wrongScore: number;
    rightScore: number;
    answers: {
        question_id: Types.ObjectId;
        selectedOption: string;
        mark?: number;
    }[];
    isPassed: boolean;
    isChecked: boolean;
    timeTaken: number;
};

export type TestHistoryModel = Model<ITestHistory, Record<string, unknown>>;

export type ITestHistoryFilters = {
    searchTerm?: string;
    course_id?:string,
    lesson_id?:string,
    test_id?:string,
    student_id?:string,
    isPassed?:string,
    isChecked?:string,
};

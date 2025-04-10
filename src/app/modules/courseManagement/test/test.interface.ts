import { Model, Types } from 'mongoose';
import { IQuestion } from '../../question/question.interface';
import { TestType } from './test.constant';

export type ITest = {
    course_id: Types.ObjectId;
    lesson_id: Types.ObjectId;
    name: string;
    type: TestType;
    time: number;
    publishDate: Date;
    questionList: Types.ObjectId[];
    createdBy: Types.ObjectId;
    updatedBy: Types.ObjectId;
    isCompleted: boolean;
};

export type TestModel = Model<ITest, Record<string, unknown>>;

export type ITestFilters = {
    searchTerm?: string;
    type?: string;
    ownTest?: string;
    date?: string;
    course_id?: string;
    lesson_id?: string;
};

import { Model, Types } from 'mongoose';
import { QuestionType } from '../question/question.constant';

export type IQuestionPattern = {
    category_id: Types.ObjectId[];
    time: number;
    mainSubjects: [
        {
            subject: string;
            questionType: QuestionType;
            questionCount: number;
        },
    ];
    optionalSubjects: [
        {
            subject: string;
            questionType: QuestionType;
            questionCount: number;
        },
    ];
    createdBy: Types.ObjectId;
    updatedBy: Types.ObjectId;
};

export type QuestionPatternModel = Model<
    IQuestionPattern,
    Record<string, unknown>
>;

export type IQuestionPatternFilters = {
    searchTerm?: string;
    createdBy?: string;
    categoryType?: string;
    categoryDivision?: string;
    categoryUniversityType?: string;
    categoryUniversityName?: string;
    categoryChapter?: string;
    categorySubject?: string;
};

import { Model, Types } from 'mongoose';

export type ISkippedQuestion = {
    student_id: Types.ObjectId;
    question_id: Types.ObjectId[];
};

export type SkippedQuestionModel = Model<
    ISkippedQuestion,
    Record<string, unknown>
>;

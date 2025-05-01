import { Schema, model } from 'mongoose';
import { ISkippedQuestion, SkippedQuestionModel } from './skippedQuestion.interface';



const SkippedQuestionSchema = new Schema<ISkippedQuestion, SkippedQuestionModel>(
    {
       student_id: {
            type: Schema.Types.ObjectId,
            ref: 'Student',
            required: true,
        },
        question_id: {
            type: [Schema.Types.ObjectId],
            ref: 'Question',
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

export const SkippedQuestion = model<ISkippedQuestion, SkippedQuestionModel>(
    'SkippedQuestion',
    SkippedQuestionSchema,
);

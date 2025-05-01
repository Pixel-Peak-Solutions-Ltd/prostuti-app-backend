import { Schema, model } from 'mongoose';
import { IWrongQuestion, WrongQuestionModel } from './wrongQuestion.interface';


const WrongQuestionSchema = new Schema<IWrongQuestion, WrongQuestionModel>(
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

export const WrongQuestion = model<IWrongQuestion, WrongQuestionModel>(
    'WrongQuestion',
    WrongQuestionSchema,
);

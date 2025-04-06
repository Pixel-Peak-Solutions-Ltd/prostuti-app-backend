import { Schema, model } from 'mongoose';
import { IQuiz, QuizModel } from './quiz.interface';
import { QuestionTypes } from '../question/question.constant';

const QuizSchema = new Schema<IQuiz, QuizModel>(
    {
        student_id: {
            type: Schema.Types.ObjectId,
            ref: 'Student',
            required: true,
            index: true,
        },
        category_id: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: QuestionTypes,
            required: [true, 'Type is required.'],
        },
        questions: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Question',
                required: true,
            },
        ],
        answers: [
            {
                question_id: {
                    type: Schema.Types.ObjectId,
                    ref: 'Question',
                    required: true,
                },
                selectedOption: {
                    type: String,
                    required: true,
                },
            },
        ],
        score: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalQuestions: {
            type: Number,
            required: true,
            min: 1,
        },
        completedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    },
);

export const Quiz = model<IQuiz, QuizModel>('Quiz', QuizSchema);

import { Schema, model } from 'mongoose';
import { IQuiz, QuizModel } from './quiz.interface';
import { QuestionTypes } from '../question/question.constant';
import { quizType } from './quiz.constant';

const QuizSchema = new Schema<IQuiz, QuizModel>(
    {
        student_id: {
            type: Schema.Types.ObjectId,
            ref: 'Student',
            required: true,
            index: true,
        },
        category_id: [{
            type: Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
            index: true,
        }],
        type: {
            type: String,
            enum: quizType,
            required: [true, 'Quiz Type is required.'],
        },
        time:{
            type: Number,
            required: true,
            min: 1,
        },
        questionCount: {
            
            type: Number,
            required: true,
            min: 1,
        },
        isNegativeMarking: {
            type: Boolean,
            default: false,
        },
        questionType: {
            type: String,
            enum: QuestionTypes,
            required: [true, 'Question Type is required.'],
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
                mark: {
                    type: Number,
                    default: 0,
                },
            },
        ],
        totalScore: {
            type: Number,
            required: true,
            min: 0,
        },
        score: {
            type: Number,
            required: true,
            min: 0,
        },
        rightScore: {
            type: Number,
            required: true,
            min: 0,
        },
        wrongScore: {
            type: Number,
            required: true,
            min: 0,
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

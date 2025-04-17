import { Schema, model } from 'mongoose';
import { ITestHistory, TestHistoryModel } from './testHistory.interface';

const TestHistorySchema = new Schema<ITestHistory, TestHistoryModel>(
    {
        course_id: {
            type: Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
        },
        lesson_id: {
            type: Schema.Types.ObjectId,
            ref: 'Lesson',
            required: true,
        },
        test_id: {
            type: Schema.Types.ObjectId,
            ref: 'Test',
            required: true,
        },

        student_id: {
            type: Schema.Types.ObjectId,
            ref: 'Student',
            required: true,
        },
        attemptedAt: {
            type: Date,
            default: Date.now,
        },
        score: {
            type: Schema.Types.Number,
            required: true,
            min: 0,
        },
        totalScore: {
            type: Number,
            required: true,
            min: 1,
        },

        wrongScore: {
            type: Number,
            required: true,
            min: 0,
        },
        rightScore: {
            type: Number,
            required: true,
            min: 0,
        },
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
                },
            },
        ],
        skippedQuestions: {
            type: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
            default: [],
        },
        wrongQuestions: {
            type: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
            default: [],
        },
        isPassed: {
            type: Boolean,
            required: true,
        },
        isChecked: {
            type: Boolean,
            required: true,
            default: true,
        },
        timeTaken: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    },
);
TestHistorySchema.index({ test_id: 1, student_id: 1 }, { unique: true });

export const TestHistory = model<ITestHistory, TestHistoryModel>(
    'TestHistory',
    TestHistorySchema,
);

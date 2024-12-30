import { Schema, model } from 'mongoose';
import { QuestionTypes } from '../../question/question.constant';
import { IQuestion } from '../../question/question.interface';
import { TestTypes } from './test.constant';
import { ITest, TestModel } from './test.interface';

const TestSchema = new Schema<ITest, TestModel>(
    {
        course_id: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Course',
        },
        lesson_id: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Lesson',
        },
        name: {
            type: String,
            required: [true, 'Test name is required'],
        },
        type: {
            type: String,
            enum: TestTypes,
            required: [true, 'Type is required.'],
        },
        time: {
            type: Number,
            required: [true, 'Test duration is required'],
        },
        publishDate: {
            type: Date,
            required: [true, 'Test published date is required'],
        },

        questionList: {
            type: [

                {
                    type: Schema.Types.ObjectId,
                    ref: 'Question',
                    required: false,
                },


            ],
            required: [true, 'Question list is required'],
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            default: function () {
                return this.createdBy;
            },
        },
        isCompleted: {
            type: Boolean,
            default: false,
        }
    },
    {
        timestamps: true,
    },
);

export const Test = model<ITest, TestModel>('Test', TestSchema);

import { Schema, model } from 'mongoose';
import { QuestionStatuses, QuestionTypes } from './question.constant';
import { IQuestion, QuestionModel } from './question.interface';
import { imageSchema } from '../../schema';

const QuestionSchema = new Schema<IQuestion, QuestionModel>(
    {
        type: {
            type: String,
            enum: QuestionTypes,
            required: [true, 'Type is required.'],
        },
        category_id: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
        },
        title: {
            type: String,
            required: [true, 'Question title is required'],
        },
        description: {
            type: String,
            required: [true, 'Question description is required'],
        },
        hasImage: {
            type: Boolean,
            default: false,
        },
        image: {
            required: false,
            type: imageSchema,
        },
        options: {
            type: [String],
            default: undefined,
            validate: [
                {
                    validator: function (this: IQuestion, options: string[]) {
                        return this.type === 'MCQ'
                            ? options.length === 4
                            : true;
                    },
                    message: 'MCQ questions must have exactly 4 options.',
                },
                {
                    validator: function (this: IQuestion, options: string[]) {
                        return this.type === 'MCQ'
                            ? options.includes(this.correctOption || '')
                            : true;
                    },
                    message: 'The correct option must be one of the options.',
                },
            ],
        },
        correctOption: {
            type: String,
            validate: {
                validator: function (this: IQuestion, correctOption: string) {
                    return this.type === 'MCQ' ? !!correctOption : true;
                },
                message:
                    "The 'correctOption' field is required for MCQ questions.",
            },
        },
        status: {
            type: String,
            enum: QuestionStatuses,
            required: [true, 'Question status is required.'],
            default: 'NOT_REVIEWED',
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        reviewedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        },
        reviewedAt: {
            type: Date,
            required: function () {
                return !!this.reviewedBy;
            },
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            default: function () {
                return this.createdBy;
            },
        },
    },
    {
        timestamps: true,
    },
);

export const Question = model<IQuestion, QuestionModel>(
    'Question',
    QuestionSchema,
);

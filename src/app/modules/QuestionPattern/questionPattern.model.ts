import { Schema, model } from 'mongoose';

import {
    QuestionPatternModel,
    IQuestionPattern,
} from './questionPattern.interface';
import { QuestionTypes } from '../question/question.constant';

const QuestionPatternSchema = new Schema<
    IQuestionPattern,
    QuestionPatternModel
>(
    {
        category_id: {
            type: [
                {
                    type: Schema.Types.ObjectId,
                    ref: 'Category',
                    required: true,
                },
            ],
            required: [true, 'Category is required'],
        },
        time: { type: Number, required: true },
        mainSubjects: [
            {
                subject: { type: String, required: true },
                questionType: {
                    type: String,
                    enum: QuestionTypes,
                    required: true,
                },
                questionCount: { type: Number, required: true },
            },
        ],
        optionalSubjects: [
            {
                subject: { type: String, required: true },
                questionType: {
                    type: String,
                    enum: QuestionTypes,
                    required: true,
                },
                questionCount: { type: Number, required: true },
            },
        ],
        createdBy: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: 'Admin',
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

// Add unique index on category_id
QuestionPatternSchema.index(
    { category_id: 1 },
    { unique: true }
  );

export const QuestionPattern = model<IQuestionPattern, QuestionPatternModel>(
    'QuestionPattern',
    QuestionPatternSchema,
);

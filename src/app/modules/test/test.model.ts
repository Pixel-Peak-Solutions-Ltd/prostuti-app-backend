import { Schema, model } from 'mongoose';
import { TestTypes } from './test.constant';
import { ITest, TestModel } from './test.interface';
import { QuestionTypes } from '../question/question.constant';
import { IQuestion } from '../question/question.interface';

const TestSchema = new Schema<ITest, TestModel>(
    {
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

        questionList: {
            type: [
                {
                    questionId: {
                        type: Schema.Types.ObjectId,
                        ref: 'Question',
                        required: false,
                    },
                    newQuestion: {
                        type: new Schema(
                            {
                                type: {
                                    type: String,
                                    enum: QuestionTypes,
                                    required: [true, 'Type is required.'],
                                },

                                title: {
                                    type: String,
                                    required: [
                                        true,
                                        'Question title is required',
                                    ],
                                },
                                description: {
                                    type: String,
                                    required: [
                                        true,
                                        'Question description is required',
                                    ],
                                },
                                options: {
                                    type: [String],
                                    default: undefined,
                                    validate: [
                                        {
                                            validator: function (
                                                this: IQuestion,
                                                options: string[],
                                            ) {
                                                return this.type === 'MCQ'
                                                    ? options.length === 4
                                                    : true;
                                            },
                                            message:
                                                'MCQ questions must have exactly 4 options.',
                                        },
                                        {
                                            validator: function (
                                                this: IQuestion,
                                                options: string[],
                                            ) {
                                                return this.type === 'MCQ'
                                                    ? options.includes(
                                                          this.correctOption ||
                                                              '',
                                                      )
                                                    : true;
                                            },
                                            message:
                                                'The correct option must be one of the options.',
                                        },
                                    ],
                                },
                                correctOption: {
                                    type: String,
                                    validate: {
                                        validator: function (
                                            this: IQuestion,
                                            correctOption: string,
                                        ) {
                                            return this.type === 'MCQ'
                                                ? !!correctOption
                                                : true;
                                        },
                                        message:
                                            "The 'correctOption' field is required for MCQ questions.",
                                    },
                                },
                            },
                            { _id: false },
                        ),
                        required: false,
                    },
                },
            ],
            required: [true, 'Question list is required'],
            validate: {
                validator: function (questionList) {
                  const testType = this.type; 
              
                  
                  return questionList.every((item: any) => {
                    
                    if (item.newQuestion) {
                      return item.newQuestion.type === testType;
                    }
              
                   
                    return true;
                  });
                },
                message: 'All new questions must have the same type as the test type.',
              },
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
    },
    {
        timestamps: true,
    },
);

export const Test = model<ITest, TestModel>('Test', TestSchema);

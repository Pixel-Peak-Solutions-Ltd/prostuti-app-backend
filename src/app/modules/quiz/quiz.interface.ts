import { Model, Types } from "mongoose";
import { QuestionType } from "../question/question.constant";
import { QuizType } from "./quiz.constant";


export type IQuiz={
  student_id: Types.ObjectId;
  category_id: Types.ObjectId[];
  type:QuizType;
  time: number;//minute
  questionCount: number;
  isNegativeMarking: boolean;
  questionType: QuestionType
  questions: Types.ObjectId[];
  answers: {
    question_id: Types.ObjectId;
    selectedOption: string;
    mark?: number;
  }[];
  totalScore: number;
  score: number;
  rightScore: number;
  wrongScore: number;
  completedAt?: Date;
}
    


  export type QuizModel = Model<
  IQuiz,
  Record<string, unknown>
>;

export type IQuizFilters = {
  searchTerm?: string;
  student_id?: string;
  category_id?: string;
  type?:string  
};

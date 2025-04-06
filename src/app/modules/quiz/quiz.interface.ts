import { Model, Types } from "mongoose";
import { QuestionType } from "../question/question.constant";


export type IQuiz={
  student_id: Types.ObjectId;
  category_id: Types.ObjectId;
  type: QuestionType
  questions: Types.ObjectId[];
  answers: {
    question_id: Types.ObjectId;
    selectedOption: string;
  }[];
  score: number;
  totalQuestions: number;
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

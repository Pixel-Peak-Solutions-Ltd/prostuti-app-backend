import { Model, Types } from "mongoose";
import { QuestionType } from "./question.constant";


export type IQuestion={
    type: QuestionType
    category_id:Types.ObjectId,
    title:string,
    description:string,
    options?:string[],
    correctOption?:string,
    createdBy:Types.ObjectId,
    updatedBy:Types.ObjectId
  }


  export type QuestionModel = Model<
  IQuestion,
  Record<string, unknown>
>;

export type IQuestionFilters = {
  searchTerm?: string;
  categoryType?: string;
  class?: string;
  division?: string;
  subject?: string;
  universityType?: string;
  universityName?: string;
  unit?: string;
  type?:string,
};

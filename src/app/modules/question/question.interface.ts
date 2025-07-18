import { Model, Types } from "mongoose";
import { QuestionStatus, QuestionType } from "./question.constant";
import { TImage } from "../../interfaces/common";


export type IQuestion={
    type: QuestionType
    category_id:Types.ObjectId,
    title:string,
    description:string,
    hasImage:boolean,
    image?:TImage
    options?:string[],
    correctOption?:string,
    status:QuestionStatus,
    createdBy:Types.ObjectId,
    reviewedBy?:Types.ObjectId,
    reviewedAt:Date,
    updatedBy:Types.ObjectId
  }


  export type QuestionModel = Model<
  IQuestion,
  Record<string, unknown>
>;

export type IQuestionFilters = {
  searchTerm?: string;
  categoryType?: string;
  division?: string;
  subject?: string;
  chapter?:string;
  universityType?: string;
  universityName?: string;
  unit?: string;
  jobType?: string;
  jobName?: string;
  lesson?: string;
  type?:string,
  ownQuestion?: string;
  hasImage?:string;
  status?:string


};

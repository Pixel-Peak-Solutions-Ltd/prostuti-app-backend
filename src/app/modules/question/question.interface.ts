import { Model, Types } from "mongoose";
import { QuestionType } from "./question.constant";
import { TImage } from "../../interfaces/common";

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type IQuestion={
    type: QuestionType
    category_id:Types.ObjectId,
    title:string,
    description:string,
    hasImage:boolean,
    image?:TImage
    options?:string[],
    correctOption?:string,
    createdBy:Types.ObjectId,
    updatedBy:Types.ObjectId,
    approvalStatus: ApprovalStatus;
    approvedBy?: Types.ObjectId;
    approvedAt?: Date;
    rejectionReason?: string;
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
  type?:string,
  ownQuestion?: string;
  hasImage?:string

};

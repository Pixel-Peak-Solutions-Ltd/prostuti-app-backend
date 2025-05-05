import { Model, Types } from "mongoose";


export type IWrongQuestion={
   student_id: Types.ObjectId;
    question_id: Types.ObjectId[]; 
  }


  export type WrongQuestionModel = Model<
  IWrongQuestion,
  Record<string, unknown>
>;


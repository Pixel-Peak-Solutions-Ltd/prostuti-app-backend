import { Model, Types } from "mongoose";
import { TestType } from "./test.constant";
import { IQuestion } from "../question/question.interface";



export type ITest={
    name:string,
    type: TestType,
    time:number,
    publishDate: Date;
    questionList: Array<{
        questionId?: Types.ObjectId; 
        newQuestion?: Partial<IQuestion>;
    }>;
    createdBy:Types.ObjectId,
    updatedBy:Types.ObjectId
  }


  export type TestModel = Model<
  ITest,
  Record<string, unknown>
>;

export type ITestFilters = {
  searchTerm?: string;
  type?: string;
  ownTest?: string;
  date?: string;

};

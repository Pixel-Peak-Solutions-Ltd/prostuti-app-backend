import { Model, Types } from "mongoose";
import { RoutineType } from "./routine.constant";


export type IRoutine={
    type: RoutineType
    date:Date,
    createdBy:Types.ObjectId,
    updatedBy:Types.ObjectId
  }


  export type RoutineModel = Model<
  IRoutine,
  Record<string, unknown>
>;

export type IRoutineFilters = {
  searchTerm?: string;
  type?: string;
  date?:string
}

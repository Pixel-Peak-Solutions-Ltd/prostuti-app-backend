import { Model, Types } from "mongoose";


export type ITeacherLog={
    teacher_id:Types.ObjectId,
    action:string,
    description?:string
    ip:string,
    userAgent:string
    
  }


  export type TeacherLogModel = Model<
  ITeacherLog,
  Record<string, unknown>
>;

export type ITeacherLogFilters = {
  searchTerm?: string;
  teacher_id?:string
  created_at?:string
 
};

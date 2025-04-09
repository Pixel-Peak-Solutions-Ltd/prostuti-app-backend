import { Model, Types } from "mongoose";

export type ILeaderBoard={
    student_id: Types.ObjectId;
    course_id: Types.ObjectId;
    totalScore: number;
    totalTestScore: number;
    totalAssignmentScore: number;
    attemptedTests: number;
    attemptedAssignments: number;
    updatedAt: Date;
  }


  export type LeaderBoardModel = Model<
  ILeaderBoard,
  Record<string, unknown>
>;

export type ILeaderBoardFilters = {
  searchTerm?: string;
};

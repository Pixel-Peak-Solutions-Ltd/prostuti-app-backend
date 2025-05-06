import { Model, Types } from 'mongoose';

export type ILeaderBoard = {
    student_id: Types.ObjectId;
    course_id: Types.ObjectId;
    totalScore: number;
    totalTestScore: number;
    totalAssignmentScore: number;
    attemptedTests: number;
    attemptedAssignments: number;
    updatedAt: Date;
};

export type LeaderBoardModel = Model<ILeaderBoard, Record<string, unknown>>;

export type ILeaderBoardFilters = {
    searchTerm?: string;
};

export interface PopulatedAssignment {
    _id: Types.ObjectId;
    assignment_id: { assignmentNo: string; marks: number };
    studentProfile_id: { name: string };
    givenMark: string;
}

export interface PopulatedTest {
    _id: Types.ObjectId;
    test_id: { name: string } | null;
    student_id: { name: string };
    totalScore: number;
    score: number;
}

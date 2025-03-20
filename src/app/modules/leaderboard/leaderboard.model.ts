import { Schema, model } from 'mongoose';
import { ILeaderBoard, LeaderBoardModel } from './leaderboard.interface';

const LeaderBoardSchema = new Schema<ILeaderBoard, LeaderBoardModel>(
    {
        student_id: {
            type: Schema.Types.ObjectId,
            ref: 'Student',
            required: true,
        },
        course_id: {
            type: Schema.Types.ObjectId,
            ref: 'Course',
            required: false, // Null means global leaderboard
        },
        totalTestScore: {
            type: Number,
            required: true,
            default: 0,
        },
        totalAssignmentScore: {
            type: Number,
            required: true,
            default: 0,
        },
        totalScore: {
            type: Number,
            required: true,
            default: 0,
        },
        attemptedTests: {
            type: Number,
            required: true,
            default: 0,
        },
        attemptedAssignments: {
            type: Number,
            required: true,
            default: 0,
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    },
);

// Index for leaderboard performance
LeaderBoardSchema.index({ course_id: 1, totalScore: -1 });
LeaderBoardSchema.index({ totalScore: -1 });
LeaderBoardSchema.index({ student_id: 1 });

export const LeaderBoard = model<ILeaderBoard, LeaderBoardModel>(
    'LeaderBoard',
    LeaderBoardSchema,
);

import { Types } from 'mongoose';
import { LeaderBoard } from './leaderboard.model';

export const updateLeaderboard = async (
    studentId: Types.ObjectId|string,
    courseId: Types.ObjectId |string| null,
    testScore: number,
    assignmentScore: number,
) => {
    try {
        const leaderboardEntry = await LeaderBoard.findOne({
            student_id: studentId,
            course_id: courseId,
        });

        if (leaderboardEntry) {
            // Update the scores
            leaderboardEntry.totalTestScore += testScore;
            leaderboardEntry.totalAssignmentScore += assignmentScore;
            leaderboardEntry.totalScore =
                leaderboardEntry.totalTestScore +
                leaderboardEntry.totalAssignmentScore;
            leaderboardEntry.updatedAt = new Date();

            // Increment test attempts if testScore > 0
            if (testScore > 0) leaderboardEntry.attemptedTests += 1;

            // Increment assignment attempts if assignmentScore > 0
            if (assignmentScore > 0) leaderboardEntry.attemptedAssignments += 1;

            await leaderboardEntry.save();
        } else {
            // Create a new leaderboard entry if not found
            await LeaderBoard.create({
                student_id: studentId,
                course_id: courseId,
                totalTestScore: testScore,
                totalAssignmentScore: assignmentScore,
                totalScore: testScore + assignmentScore,
                attemptedTests: testScore > 0 ? 1 : 0, // Set to 1 if testScore > 0
                attemptedAssignments: assignmentScore > 0 ? 1 : 0, // Set to 1 if assignmentScore > 0
                updatedAt: new Date(),
            });
        }
    } catch (error) {
        console.error('Error updating leaderboard:', error);
        throw error;
    }
};

import { StatusCodes } from 'http-status-codes';
import { TJWTDecodedUser } from '../../interfaces/jwt/jwt.type';
import { IAssignmentSubmission } from './assignmentSubmission.interface';
import { Express } from 'express';
import AppError from '../../classes/errorClasses/AppError';
import { uploadToB2 } from '../../utils/backBlaze';
import config from '../../config';
import { AssignmentSubmission } from './assignmentSubmission.model';
import { Student } from '../student/student.model';

const submitAssignment = async (
    user: TJWTDecodedUser,
    payload: Partial<IAssignmentSubmission>,
    file: Express.Multer.File | undefined,
) => {
    // Check if file exists
    if (!file) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'Assignment PDF file is required',
        );
    }

    // Upload image to BackBlaze
    const uploadedFile = await uploadToB2(
        file,
        config.backblaze_all_users_bucket_name,
        config.backblaze_all_users_bucket_id,
        'courseAssignments',
    );

    const studentProfileId = await Student.findOne({ user_id: user.userId });

    // Create course object with uploaded image
    const assignmentSubmissionData: Partial<IAssignmentSubmission> = {
        course_id: payload.course_id,
        assignment_id: payload.assignment_id,
        studentProfile_id: studentProfileId!._id,
        status: payload.status,
        submissionDate: payload.submissionDate,
        uploadFileResource: uploadedFile,
    };

    // Create new course
    const data = await AssignmentSubmission.create(assignmentSubmissionData);

    return data;
};

const getSubmittedAssignmentList = async (
    courseId: string,
    assignmentId: string,
) => {
    const assignmentSubmissionsList = await AssignmentSubmission.find({
        course_id: courseId,
        assignment_id: assignmentId,
    }).populate('studentProfile_id');

    return assignmentSubmissionsList;
};

const getASubmittedAssignment = async (assignmentSubmittedId: string) => {
    const submittedAssignment = await AssignmentSubmission.findById(
        assignmentSubmittedId,
    )
        .populate('assignment_id')
        .populate('studentProfile_id');

    return submittedAssignment;
};

const giveAssignmentMark = async (
    givenMark: string,
    assignmentSubmittedId: string,
) => {
    const updatedSubmittedAssignment =
        await AssignmentSubmission.findByIdAndUpdate(
            assignmentSubmittedId,
            { givenMark },
            { new: true, runValidators: true },
        );

    return updatedSubmittedAssignment;
};

export const assignmentSubmissionService = {
    submitAssignment,
    getSubmittedAssignmentList,
    getASubmittedAssignment,
    giveAssignmentMark,
};

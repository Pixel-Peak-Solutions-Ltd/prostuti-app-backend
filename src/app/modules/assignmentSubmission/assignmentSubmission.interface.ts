import { Types } from 'mongoose';
import { ASSIGNMENT_SUBMISSION_STATUS } from './assignmentSubmission.constant';

export type TAssignmentSubmissionStatus =
    keyof typeof ASSIGNMENT_SUBMISSION_STATUS;

export interface TResource {
    diskType: string;
    path: string;
    originalName: string;
    modifiedName: string;
    fileId: string;
}

export interface IAssignmentSubmission {
    course_id: Types.ObjectId;
    assignment_id: Types.ObjectId;
    studentProfile_id: Types.ObjectId | string;
    status: TAssignmentSubmissionStatus;
    submissionDate: Date;
    uploadFileResource: TResource;
    givenMark: string;
}

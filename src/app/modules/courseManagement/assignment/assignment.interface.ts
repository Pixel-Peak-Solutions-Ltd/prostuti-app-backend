import { Types } from 'mongoose';

export interface TResource {
    diskType: string;
    path: string;
    originalName: string;
    modifiedName: string;
    fileId: string;
}

export interface IAssignment {
    course_id: Types.ObjectId;
    lesson_id: Types.ObjectId;
    assignmentNo: string;
    marks: number;
    unlockDate: Date;
    details: string;
    uploadFileResources: TResource[];
}

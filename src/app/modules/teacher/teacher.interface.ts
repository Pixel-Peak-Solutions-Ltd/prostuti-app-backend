import { Types } from 'mongoose';
import { ASSIGNED_WORKS } from './teacher.constant';

export interface TImage {
    diskType: string;
    path: string;
    originalName: string;
    modifiedName: string;
    fileId: string;
}
export interface ITeacher {
    user_id: Types.ObjectId;
    teacherId: string;
    name: string;
    phone: string;
    email: string;
    image?: TImage;
    joinedDate: string;
    subject: string;
    assignedWorks: string[];
    jobType: string;
}

// Define allowed update fields type
export type TAllowedTeacherUpdates = Pick<
    ITeacher,
    'name' | 'phone' | 'subject' | 'jobType'
>;

export type TUpdatePayloadType = Partial<
    TAllowedTeacherUpdates & { image?: TImage }
>;

export type TAssignedWorks = keyof typeof ASSIGNED_WORKS;

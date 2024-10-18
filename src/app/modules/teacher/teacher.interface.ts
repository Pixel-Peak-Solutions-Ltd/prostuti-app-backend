import { Types } from 'mongoose';

export interface ITeacher {
    userId: Types.ObjectId;
    teacherId: string;
    teacherName: string;
    teacherPhone: string;
    teacherEmail: string;
    teacherProfileImageURL: string;
}

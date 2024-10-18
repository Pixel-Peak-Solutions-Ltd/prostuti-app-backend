import { Types } from 'mongoose';

export interface IStudent {
    userId: Types.ObjectId;
    studentId: string;
    studentName: string;
    studentPhone: string;
    studentEmail: string;
    studentProfileImageURL: string;
}

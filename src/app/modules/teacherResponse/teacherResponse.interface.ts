import { Model, Types } from 'mongoose';

export interface ITeacherResponse {
    _id?: Types.ObjectId;
    messageRequestId: Types.ObjectId;
    teacherId: Types.ObjectId;
    status: 'pending' | 'accepted' | 'declined';
    createdAt: Date;
    updatedAt: Date;
}

export type TeacherResponseModel = Model<ITeacherResponse, Record<string, unknown>>;
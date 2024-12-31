import { Types } from "mongoose";

export interface IStudentProgress {
    user_id: Types.ObjectId;
    materialType: 'record' | 'assignment' | 'resource' | 'test';
    material_id: Types.ObjectId;
    course_id: Types.ObjectId;
    isCompleted: boolean;
    completionDate?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
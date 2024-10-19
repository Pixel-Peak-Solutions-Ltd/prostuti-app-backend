import { Types } from 'mongoose';

export interface ITeacher {
    user_id: Types.ObjectId;
    teacherId: string;
    name: string;
    phone: string;
    email: string;
    profileImageURL: string;
}

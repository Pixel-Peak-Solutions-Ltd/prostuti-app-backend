import { Types } from 'mongoose';

export interface IStudent {
    user_id: Types.ObjectId;
    studentId: string;
    name: string;
    phone: string;
    email: string;
    profileImageURL: string;
}

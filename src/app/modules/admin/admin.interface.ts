import { Types } from 'mongoose';

export interface IAdmin {
    user_id: Types.ObjectId;
    adminId: string;
    name: string;
    phone: string;
    email: string;
    profileImageURL: string;
}

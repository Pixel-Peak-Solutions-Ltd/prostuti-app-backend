import { Types } from 'mongoose';

export interface IAdmin {
    userId: Types.ObjectId;
    adminId: string;
    adminName: string;
    adminPhone: string;
    adminEmail: string;
    adminProfileImageURL: string;
}

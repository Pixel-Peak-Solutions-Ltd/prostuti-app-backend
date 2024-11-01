import { Types } from 'mongoose';

interface TImage {
    url: string;
    diskType: string;
    path: string;
    originalName: string;
    modifiedName: string;
}
export interface ITeacher {
    user_id: Types.ObjectId;
    teacherId: string;
    name: string;
    phone: string;
    email: string;
    // profileImageURL: string;
    image?: TImage;
    joinedDate: string;
    subject: string;
    jobType: string;
}

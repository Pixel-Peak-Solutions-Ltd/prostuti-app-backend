import { Types } from 'mongoose';

export interface IStudentNotification {
    student_id: Types.ObjectId;
    title: string;
    message: string;
    isRead?: boolean;
}

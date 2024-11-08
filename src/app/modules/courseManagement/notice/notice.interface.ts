import { Types } from 'mongoose';

export interface INotice {
    course_id: Types.ObjectId;
    notice: string;
}

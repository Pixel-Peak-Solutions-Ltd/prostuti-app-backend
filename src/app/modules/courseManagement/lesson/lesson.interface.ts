import { Types } from 'mongoose';

export interface ILesson {
    number: string;
    name: string;
    course_id: Types.ObjectId;
}

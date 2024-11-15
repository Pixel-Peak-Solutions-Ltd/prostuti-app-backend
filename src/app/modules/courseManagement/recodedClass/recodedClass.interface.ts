import { Types } from 'mongoose';

export interface IRecodedClass {
    course_id: Types.ObjectId;
    lesson_id: Types.ObjectId;
    recodeClassName: string;
    classDate: Date;
    classDetails: string;
    classVideoURL: string[];
}

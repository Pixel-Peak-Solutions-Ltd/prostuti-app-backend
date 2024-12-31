import { Types } from 'mongoose';

export interface TVideo {
    diskType: string;
    path: string;
    originalName: string;
    modifiedName: string;
    fileId: string;
}

export interface IRecodedClass {
    course_id: Types.ObjectId;
    lesson_id: Types.ObjectId;
    recodeClassName: string;
    classDate: Date;
    classDetails: string;
    classVideoURL: TVideo;
    isCompleted: boolean;
}

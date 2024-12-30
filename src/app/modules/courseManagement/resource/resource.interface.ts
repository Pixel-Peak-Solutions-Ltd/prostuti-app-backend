import { Types } from 'mongoose';

export interface TResource {
    diskType: string;
    path: string;
    originalName: string;
    modifiedName: string;
    fileId: string;
}

export interface IResources {
    course_id: Types.ObjectId;
    lesson_id: Types.ObjectId;
    name: string;
    resourceDate: Date;
    uploadFileResources: TResource[];
    isCompleted: boolean;
}

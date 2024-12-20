import { Types } from 'mongoose';
import { CategoryType } from '../category/category.constant';

export interface TImage {
    diskType: string;
    path: string;
    originalName: string;
    modifiedName: string;
    fileId: string;
}

export interface IStudent {
    user_id: Types.ObjectId;
    studentId: string;
    name: string;
    categoryType: CategoryType;
    phone: string;
    email: string;
    image?: TImage;
    enrolledCourses?: Types.ObjectId[],
    subscriptionStartDate?: Date;
    subscriptionEndDate?: Date;
}

// Define allowed update fields type
export type TAllowedStudentUpdates = Pick<IStudent, 'name' | 'categoryType'>;

export type TUpdatePayloadType = Partial<
    TAllowedStudentUpdates & { image?: TImage }
>;

import { Types } from 'mongoose';
import { CategoryType } from '../category/category.constant';

export interface IStudent {
    user_id: Types.ObjectId;
    studentId: string;
    name: string;
    categoryType: CategoryType;
    phone: string;
    email: string;
    profileImageURL: string;
}

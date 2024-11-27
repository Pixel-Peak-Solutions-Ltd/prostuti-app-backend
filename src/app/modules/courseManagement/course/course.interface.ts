import { Types } from 'mongoose';
import { CategoryType } from '../../category/category.constant';

export type TPriceType = 'Subscription';

export interface TImage {
    diskType: string;
    path: string;
    originalName: string;
    modifiedName: string;
    fileId: string;
}

export interface ICourse {
    teacher_id: Types.ObjectId;
    name: string;
    category: CategoryType;
    image: TImage;
    details: string;
    priceType: TPriceType;
    price: number;
    isPending: boolean;
    isPublished: boolean;
    approvedBy: Types.ObjectId;
}

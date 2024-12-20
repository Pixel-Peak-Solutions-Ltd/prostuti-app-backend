import { Types } from 'mongoose';

export type TPriceType = 'Free'|'Paid'|'Subscription';

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
    category_id: Types.ObjectId;
    image: TImage;
    details: string;
    priceType: TPriceType;
    price: number;
    isPending: boolean;
    isPublished: boolean;
    approvedBy: Types.ObjectId;
}

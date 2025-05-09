import { Types } from 'mongoose';

export type TPriceType = 'Free' | 'Paid' | 'Subscription';

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
    totalLessons?: number;
    totalRecodedClasses?: number;
    totalResources?: number;
    totalAssignments?: number;
    totalTests?: number;
}

export type ICourseFilters = {
    searchTerm?: string;
    name?: string;
    teacher_id?: string;
    isPending?: string;
    isPublished?: string;
    categoryType?: string
    categoryDivision?: string
    categoryUniversityType?: string;
    categoryUniversityName?: string;
    categoryChapter?: string;
    categorySubject?: string;
    categoryJobType?: string;
    categoryJobName?: string;
    categoryUnit?: string;
    categoryLesson?: string;
  };

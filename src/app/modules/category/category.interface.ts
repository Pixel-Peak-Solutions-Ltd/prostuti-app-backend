import { Model } from 'mongoose';
import { CategoryDivision, CategoryType, CategoryUniversityType } from './category.constant';

export type ICategory = {
    type: CategoryType;
    // class?: CategoryClass
    division?: CategoryDivision;
    subject: string;
    chapter?: string;
    universityType?: CategoryUniversityType;
    universityName?: string;
    unit?: string;
};

export type CategoryModel = Model<ICategory, Record<string, unknown>>;

export type ICategoryFilters = {
    searchTerm?: string;
    type?: string;
    // class?: string;
    division?: string;
    subject?: string;
    chapter?: string;
    universityType?: string;
    universityName?: string;
    unit?: string;
};

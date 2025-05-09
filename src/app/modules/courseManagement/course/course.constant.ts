import { TPriceType } from './course.interface';

export const priceType: TPriceType[] = ['Free','Paid','Subscription'];

export const courseFilterableFields = [
    'searchTerm',
    'name',
    'teacher_id',
    "isPending",
    'isPublished',
    'categoryType',
    'categoryDivision',
    'categoryUniversityType',
    'categoryUniversityName',
    'categoryChapter',
    'categorySubject',
    'categoryJobType',
    'categoryJobName',
    'categoryUnit',
    "categoryLesson",
  ];

  export const courseSearchableFields = [
    "name","details"
  ];
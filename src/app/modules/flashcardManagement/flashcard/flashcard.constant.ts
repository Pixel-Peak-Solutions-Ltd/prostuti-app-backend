export type VisibilityType = 'ONLY_ME' | 'EVERYONE' 
export const visibilityType: VisibilityType[] = ['ONLY_ME', 'EVERYONE'];
export const flashcardFilterableFields = [
    'searchTerm',
    'title',
    'studentId',
    'isApproved',
    'visibility',
    'categoryType',
    'categoryDivision',
    'categoryUniversityType',
    'categoryUniversityName',
    'categoryChapter',
    'categorySubject',
  ];

  export const flashcardSearchableFields = [
    'title',
  ];
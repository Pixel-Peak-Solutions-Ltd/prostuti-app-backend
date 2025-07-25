export type CategoryType = 'Academic' | 'Admission' | 'Job';

//academic
export type CategoryDivision = 'Science' | 'Commerce' | 'Arts'| 'Common';

//Admission
export type CategoryUniversityType = 'Engineering' | 'Medical' |'University';

export const categoryType: CategoryType[] = ['Academic', 'Admission', 'Job'];
// export const categoryClass: CategoryClass[] = ['9', '10', '11', '12'];
export const categoryDivision: CategoryDivision[] = [
    'Science',
    'Commerce',
    'Arts',
    'Common',
];
export const categoryUniversityType: CategoryUniversityType[] = [
    'Engineering',
    'Medical',
    'University'
];

//filter
export const categoryFilterableFields = [
    'searchTerm',
    'type',
    // 'class',
    'division',
    'subject',
    'universityType',
    'universityName',
    "unit",
    'jobType',
    'jobName',
    // 'unit',
];
export const categoryTypeFilterableFields = ['searchTerm'];
export const categoryDivisionFilterableFields = ['searchTerm', 'type'];
export const categoryUniversityTypeFilterableFields = ['searchTerm', 'type'];
export const categoryUniversityNameFilterableFields = [
    'searchTerm',
    'type',
    'universityType',
];
export const categoryUnitFilterableFields = [
    'searchTerm',
    'type',
    'universityType',
    'universityName',
];
export const categoryJobTypeFilterableFields = [
    'searchTerm',
    'type',   
];
export const categoryJobNameFilterableFields = [
    'searchTerm',
    'type',
    'jobType',
];

export const categorySubjectFilterableFields = [
    'searchTerm',
    'type',
    'division',
    'universityType',
    'universityName',
    'jobType',
    'jobName',
    // 'unit',
];
export const categoryChapterFilterableFields = [
    'searchTerm',
    'type',
    'division',
    'universityType',
    'universityName',
    'jobType',
    'jobName',
    'unit',
    'subject',
];
export const categoryLessonFilterableFields = [
    'searchTerm',
    'type',
    'division',
    'universityType',
    'universityName',
    'jobType',
    'jobName',
    'unit',
    'subject',
    'chapter',
];
//searchTerm
export const categorySearchableFields = [
    'type',
    // 'class',
    'division',
    'subject',
    'universityType',
    'universityName',
    'unit',
    'jobType',
    'jobName',
    'chapter',
    'lesson',
    
];

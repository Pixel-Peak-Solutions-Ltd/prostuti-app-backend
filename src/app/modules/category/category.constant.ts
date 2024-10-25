export type CategoryType = 'Academic' | 'Admission' | 'Job';
// export type CategoryClass = '9' | '10' | '11' | '12';
export type CategoryDivision = 'Science' | 'Commerce' |'Common'

export const categoryType: CategoryType[] = ['Academic', 'Admission', 'Job'];
// export const categoryClass: CategoryClass[] = ['9', '10', '11', '12'];
export const categoryDivision: CategoryDivision[] = ['Science', 'Commerce','Common'];

//filter
export const categoryFilterableFields = [
    'searchTerm',
    'type',
    // 'class',
    'division',
    'subject',
    'universityType',
    'universityName',
    'unit',
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
];

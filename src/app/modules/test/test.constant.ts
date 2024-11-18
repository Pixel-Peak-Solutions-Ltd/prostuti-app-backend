export type TestType = 'MCQ' | 'Written'


export const TestTypes: TestType[] = ["MCQ","Written"];


//filter
export const TestFilterableFields = [
    'searchTerm',
    'type',
    "ownTest",
    "date",
    "course_id",
    "lesson_id"
];

//searchTerm
export const TestSearchableFields = [
    "name",
    
];
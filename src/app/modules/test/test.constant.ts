export type TestType = 'MCQ' | 'Written'


export const TestTypes: TestType[] = ["MCQ","Written"];


//filter
export const TestFilterableFields = [
    'searchTerm',
    'type',
    "ownTest",
    "date"
];

//searchTerm
export const TestSearchableFields = [
    "name",
    
];
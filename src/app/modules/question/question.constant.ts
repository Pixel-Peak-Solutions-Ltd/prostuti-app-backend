export type QuestionType = 'MCQ' | 'Written'


export const QuestionTypes: QuestionType[] = ["MCQ","Written"];


//filter
export const QuestionFilterableFields = [
    'searchTerm',
    'CategoryType',
    'class',
    'division',
    'subject',
    'universityType',
    'universityName',
    'unit',
    'type'
];

//searchTerm
export const QuestionSearchableFields = [
    "title",
    "description"
];

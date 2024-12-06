export type QuestionType = 'MCQ' | 'Written'


export const QuestionTypes: QuestionType[] = ["MCQ","Written"];


//filter
export const QuestionFilterableFields = [
    'searchTerm',
    'categoryType',
    'division',
    'subject',
    'chapter',
    'universityType',
    'universityName',
    'unit',
    'type',
    "ownQuestion"
];

//searchTerm
export const QuestionSearchableFields = [
    "title",
    "description"
];

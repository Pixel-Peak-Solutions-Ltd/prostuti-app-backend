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
    'jobType',
    'jobName',
    'unit',
    'type',
    "ownQuestion",
    "hasImage"
];

//searchTerm
export const QuestionSearchableFields = [
    "title",
    "description"
];

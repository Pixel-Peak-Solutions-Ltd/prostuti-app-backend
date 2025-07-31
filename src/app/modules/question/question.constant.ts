export type QuestionType = 'MCQ' | 'Written'
export type QuestionStatus="NOT_REVIEWED"|"APPROVED"|"REJECTED"


export const QuestionTypes: QuestionType[] = ["MCQ","Written"];
export const QuestionStatuses:QuestionStatus[]=["NOT_REVIEWED","APPROVED","REJECTED"]


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
    "hasImage",
    "status"
];

//searchTerm
export const QuestionSearchableFields = [
    "title",
    "description"
];

export type QuizType = 'Segment'|'Mock'|"Quizzer"
export const quizType: QuizType[] = [
    'Segment',
    'Mock',
    'Quizzer'
];

export type QuizzerFilter = "Favorite"|"Wrong"|"Skipped"
export const quizzerFilter:QuizzerFilter[] = [
    'Favorite',
    'Wrong',
    'Skipped'
]

export const quizFilterableFields = [
    'searchTerm',
    'student_id',
    'category_id',
    'type',
    'isNegativeMarking',
    'questionType'
];



//searchTerm
export const quizSearchableFields = [];
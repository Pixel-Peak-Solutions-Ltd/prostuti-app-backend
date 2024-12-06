export type RoutineType = 'Class' | 'Assignment' | 'Exam';


export const RoutineTypes: RoutineType[] = ['Class', 'Assignment', 'Exam'];


//filter
export const RoutineFilterableFields = [
    'searchTerm',
    'type',
    'ownRoutine',
    'date',
    'course_id'
];

//searchTerm
export const RoutineSearchableFields = [
    'type'
];

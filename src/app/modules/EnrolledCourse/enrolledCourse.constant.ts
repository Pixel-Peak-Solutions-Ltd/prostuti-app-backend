export type EnrolledCourseType = 'Free' | 'One-Time' | 'Subscription';

export const EnrolledCourseTypes: EnrolledCourseType[] = [
    'Free',
    'One-Time',
    'Subscription',
];

//filter
export const EnrolledCourseFilterableFields = [
    'searchTerm',
    'student_id',
    'course_id',
    'enrollmentType',
    'enrolledAt',
    'enrolledExpireAt',
];

//searchTerm
export const EnrolledCourseSearchableFields = [];

export type EnrolledCourseType = 'Free' | 'Paid' | 'Subscription';

export const EnrolledCourseTypes: EnrolledCourseType[] = [
    'Free',
    'Paid',
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

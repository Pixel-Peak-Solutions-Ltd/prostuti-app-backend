import { Types } from 'mongoose';

export interface ICourseReview {
    course_id: Types.ObjectId;
    student_id: Types.ObjectId;
    review: string;
    rating: number; // 1 to 5 scale
    isArrived?: boolean;
}

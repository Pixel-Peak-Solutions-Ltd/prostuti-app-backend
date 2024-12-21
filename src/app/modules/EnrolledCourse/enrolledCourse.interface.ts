import { Model, Types } from "mongoose";
import { EnrolledCourseType } from "./enrolledCourse.constant";


export type IEnrolledCourse={
    student_id: Types.ObjectId; 
    course_id: Types.ObjectId;
    enrollmentType: EnrolledCourseType; 
    payment_id?: Types.ObjectId; 
    enrolledAt: Date; 
    enrolledExpireAt?:Date
  }


  export type EnrolledCourseModel = Model<
  IEnrolledCourse,
  Record<string, unknown>
>;

export type IEnrolledCourseFilters = {
  searchTerm?: string;
  student_id?: string;
  course_id?: string;
  enrollmentType?: string;
  enrolledAt?: string;
  enrolledExpireAt: string;
  
};

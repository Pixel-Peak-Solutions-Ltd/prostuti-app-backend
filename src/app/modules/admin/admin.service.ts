import { Assignment } from "../courseManagement/assignment/assignment.model";
import { Course } from "../courseManagement/course/course.model";
import { Lesson } from "../courseManagement/lesson/lesson.model";
import { RecodedClass } from "../courseManagement/recodedClass/recodedClass.model";
import { Resource } from "../courseManagement/resource/resource.model";
import { Test } from "../courseManagement/test/test.model";
import { EnrolledCourse } from "../enrolledCourse/enrolledCourse.model";
import { Student } from "../student/student.model";
import { User } from "../user/user.model";

const deleteCourseFromDB = async (courseId: string) => {
    const result = await Promise.all([
        Course.findByIdAndDelete({ _id: courseId }),
        Lesson.deleteMany({ course_id: courseId }),
        RecodedClass.deleteMany({ course_id: courseId }),
        Resource.deleteMany({ course_id: courseId }),
        Assignment.deleteMany({ course_id: courseId }),
        Test.deleteMany({ course_id: courseId }),
        EnrolledCourse.deleteOne({ course_id: courseId }),
    ])

    return result;
};

const deleteStudentFromDB = async (userId: string) => {
    const studentId = await Student.findOne({ user_id: userId }).select('_id');
    const result = await Promise.all([
        Student.deleteOne({ user_id: userId }),
        User.findByIdAndDelete({ _id: userId }),
        EnrolledCourse.deleteOne({ student_id: studentId }),
    ]);

    return result;
}

export const adminService = {
    deleteCourseFromDB,
    deleteStudentFromDB
}
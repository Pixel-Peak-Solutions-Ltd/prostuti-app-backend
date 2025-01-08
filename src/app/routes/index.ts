import { Router } from 'express';

import { authRoute } from '../modules/auth/auth.route';
import { categoryRoute } from '../modules/category/category.route';
import { assignmentRoute } from '../modules/courseManagement/assignment/assignment.route';
import { courseRoute } from '../modules/courseManagement/course/course.route';
import { lessonRoute } from '../modules/courseManagement/lesson/lesson.route';
import { noticeRoute } from '../modules/courseManagement/notice/notice.route';
import { recodedClassRoute } from '../modules/courseManagement/recodedClass/recodedClass.route';
import { resourceRoute } from '../modules/courseManagement/resource/resource.route';
import { RoutineRoute } from '../modules/courseManagement/routine/routine.route';
import { TestRoute } from '../modules/courseManagement/test/test.route';
import { favouriteQuestionRoute } from '../modules/favouriteQuestion/favouriteQuestion.route';
import { phonVerificationRoute } from '../modules/phoneVerification/phoneVerification.route';
import { QuestionRoute } from '../modules/question/question.route';
import { studentRoute } from '../modules/student/student.route';
import { teacherRoute } from '../modules/teacher/teacher.route';
import { userRoute } from '../modules/user/user.route';
import { EnrolledCourseRoute } from '../modules/enrolledCourse/enrolledCourse.route';
import { PaymentRoute } from '../modules/payment/payment.route';
import { TestHistoryRoute } from '../modules/courseManagement/test-history/testHistory.route';
import { ProgressRoute } from '../modules/progress/progress.route';
import { adminRoute } from '../modules/admin/admin.route';


const globalRoute = Router();

const routes = [
    { path: '/student', route: studentRoute },
    { path: '/user', route: userRoute },
    { path: '/auth', route: authRoute },
    { path: '/phone-verification', route: phonVerificationRoute },
    { path: '/category', route: categoryRoute },
    { path: '/question', route: QuestionRoute },
    { path: '/teacher', route: teacherRoute },
    { path: '/favourite', route: favouriteQuestionRoute },
    { path: '/course', route: courseRoute },
    { path: '/recoded-class', route: recodedClassRoute },
    { path: '/notice', route: noticeRoute },
    { path: '/resource', route: resourceRoute },
    { path: '/assignment', route: assignmentRoute },
    { path: '/lesson', route: lessonRoute },
    { path: '/test', route: TestRoute },
    { path: '/test-history', route: TestHistoryRoute },
    { path: '/routine', route: RoutineRoute },
    { path: '/enroll-course', route: EnrolledCourseRoute },
    { path: '/payment', route: PaymentRoute },
    { path: '/progress', route: ProgressRoute },
    { path: '/admin', route: adminRoute }
];

routes.forEach((route) => globalRoute.use(route.path, route.route));

export default globalRoute;

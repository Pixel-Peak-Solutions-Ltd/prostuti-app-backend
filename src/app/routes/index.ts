import { Router } from 'express';

import { adminRoute } from '../modules/admin/admin.route';
import { authRoute } from '../modules/auth/auth.route';
import { categoryRoute } from '../modules/category/category.route';
import { assignmentRoute } from '../modules/courseManagement/assignment/assignment.route';
import { courseRoute } from '../modules/courseManagement/course/course.route';
import { lessonRoute } from '../modules/courseManagement/lesson/lesson.route';
import { noticeRoute } from '../modules/courseManagement/notice/notice.route';
import { recodedClassRoute } from '../modules/courseManagement/recodedClass/recodedClass.route';
import { resourceRoute } from '../modules/courseManagement/resource/resource.route';
import { RoutineRoute } from '../modules/courseManagement/routine/routine.route';
import { TestHistoryRoute } from '../modules/courseManagement/test-history/testHistory.route';
import { TestRoute } from '../modules/courseManagement/test/test.route';
import { EnrolledCourseRoute } from '../modules/enrolledCourse/enrolledCourse.route';
import { favouriteQuestionRoute } from '../modules/favouriteQuestion/favouriteQuestion.route';
import { PaymentRoute } from '../modules/payment/payment.route';
import { phonVerificationRoute } from '../modules/phoneVerification/phoneVerification.route';
import { ProgressRoute } from '../modules/progress/progress.route';
import { QuestionRoute } from '../modules/question/question.route';
import { studentRoute } from '../modules/student/student.route';
import { teacherRoute } from '../modules/teacher/teacher.route';
import { userRoute } from '../modules/user/user.route';
import { assignmentSubmissionRoute } from '../modules/assignmentSubmission/assignmentSubmission.route';
import { SubscriptionRoute } from '../modules/subscription/subscription.route';
import { VoucherRoute } from '../modules/voucher/voucher.route';
import { teacherManagementRoute } from '../modules/teacherManagement/teacherManagement.route';
import { LeaderBoard } from '../modules/leaderboard/leaderboard.model';
import { LeaderBoardRoute } from '../modules/leaderboard/leaderboard.route';
import { flashcardRoute } from '../modules/flashcardManagement/flashcard/flashcard.route';
import { chatRoute } from '../modules/chat/chat.route';
import { notificationRoute } from '../modules/notification/notification.route';
import { editRequestRoute } from '../modules/editRequest/editRequest.route';
import { courseReviewRoute } from '../modules/courseReview/courseReview.route';
import { studentNotificationRoute } from '../modules/studentNotification/studentNotification.route';
import { quizRoute } from '../modules/quiz/quiz.route';
import { questionPatternRoute } from '../modules/QuestionPattern/questionPattern.route';

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
    { path: '/subscription', route: SubscriptionRoute },
    { path: '/progress', route: ProgressRoute },
    { path: '/admin', route: adminRoute },
    { path: '/assignment-submission', route: assignmentSubmissionRoute },
    { path: '/voucher', route: VoucherRoute },
    { path: '/teacher-management', route: teacherManagementRoute },
    { path: '/leaderboard', route: LeaderBoardRoute },
    { path: '/flashcard', route: flashcardRoute },
    { path: '/chat', route: chatRoute },
    { path: '/notifications', route: notificationRoute },
    { path: '/edit-requests', route: editRequestRoute },
    { path: '/course-review', route: courseReviewRoute },
    { path: '/student-notification', route: studentNotificationRoute },
    { path: '/quiz', route: quizRoute},
    {path:"/question-pattern", route:questionPatternRoute},
];

routes.forEach((route) => globalRoute.use(route.path, route.route));

export default globalRoute;
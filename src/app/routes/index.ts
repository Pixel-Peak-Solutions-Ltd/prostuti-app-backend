import { Router } from 'express';
import { studentRoute } from '../modules/student/student.route';
import { userRoute } from '../modules/user/user.route';
import { authRoute } from '../modules/auth/auth.route';
import { phonVerificationRoute } from '../modules/phoneVerification/phoneVerification.route';
import { categoryRoute } from '../modules/category/category.route';
import { QuestionRoute } from '../modules/question/question.route';
import { teacherRoute } from '../modules/teacher/teacher.route';
import { favouriteQuestionRoute } from '../modules/favouriteQuestion/favouriteQuestion.route';
import { courseRoute } from '../modules/courseManagement/course/course.route';

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
];

routes.forEach((route) => globalRoute.use(route.path, route.route));

export default globalRoute;

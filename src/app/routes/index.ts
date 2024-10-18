import { Router } from 'express';
import { studentRoute } from '../modules/student/student.route';
import { userRoute } from '../modules/user/user.route';
import { authRoute } from '../modules/auth/auth.route';
import { phonVerificationRoute } from '../modules/phoneVerification/phoneVerification.route';

const globalRoute = Router();

const routes = [
    { path: '/student', route: studentRoute },
    { path: '/user', route: userRoute },
    { path: '/auth', route: authRoute },
    { path: '/phone-verification', route: phonVerificationRoute },
];

routes.forEach((route) => globalRoute.use(route.path, route.route));

export default globalRoute;

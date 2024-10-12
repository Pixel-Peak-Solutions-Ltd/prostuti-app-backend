import { Router } from 'express';
import { studentRoute } from '../modules/student/student.route';

const globalRoute = Router();

const routes = [{ path: '/student', route: studentRoute }];

routes.forEach((route) => globalRoute.use(route.path, route.route));

export default globalRoute;

import { Router } from 'express';
import { studentRoutes } from '../modules/student/student.route';

const globalRoute = Router();

const routes = [{ path: '/student', route: studentRoutes }];

routes.forEach((route) => globalRoute.use(route.path, route.route));

export default globalRoute;

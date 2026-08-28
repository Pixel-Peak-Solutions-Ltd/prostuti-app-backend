import { Router } from 'express';
import { appConfigController } from './appConfig.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';

const router = Router();

router
    .get('/', appConfigController.getAppConfig)
    .patch('/', auth(USER_ROLE.admin), appConfigController.updateAppConfig);

export const appConfigRoutes = router;

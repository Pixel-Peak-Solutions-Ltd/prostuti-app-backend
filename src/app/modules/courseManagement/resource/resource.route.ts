import express, { Request, Response, NextFunction } from 'express';
import { resourceController } from './resource.controller';
import validateRequest from '../../../middlewares/validateRequest';
import { resourceValidator } from './resource.validation';
import { upload } from '../../../middlewares/multerConfig2';
import auth from '../../../middlewares/auth';
import { USER_ROLE } from '../../user/user.constant';

const router = express.Router();

router
    .post(
        '/',
        auth(USER_ROLE.teacher),
        upload.multiple('files'),
        (req: Request, res: Response, next: NextFunction) => {
            req.body = JSON.parse(req.body.data);
            next();
        },
        validateRequest(resourceValidator.createResourceValidationSchema),
        resourceController.createResource,
    )
    .get('/', resourceController.getAllResource)
    .get('/:resourceId', resourceController.getResourceByID)
    .delete('/:resourceId', resourceController.deleteResourceByID)
    .patch(
        '/:resourceId',
        auth(USER_ROLE.teacher),
        upload.multiple('files'),
        (req: Request, res: Response, next: NextFunction) => {
            req.body = JSON.parse(req.body.data);
            next();
        },
        validateRequest(resourceValidator.updateResourceValidationSchema),
        resourceController.updateResource,
    );

export const resourceRoute = router;

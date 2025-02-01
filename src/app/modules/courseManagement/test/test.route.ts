import express, { NextFunction, Request } from 'express';
import auth from '../../../middlewares/auth';
import validateRequest from '../../../middlewares/validateRequest';
import { USER_ROLE } from '../../user/user.constant';
import { TestController } from './test.controller';
import { TestValidation } from './test.validation';
import { upload } from '../../../middlewares/multerConfig';
import { Response } from 'i18n';

const router = express.Router();

router
    .post(
        '/',
        auth(USER_ROLE.teacher),
        upload.any(),
        (req: Request, res: Response, next: NextFunction) => {
            req.body = JSON.parse(req.body.data);
            next();
        },
        validateRequest(TestValidation.createTestSchema),
        TestController.createTest,
    )
    .get('/', auth(), TestController.getAllTests)
    .get('/:id', auth(), TestController.getTestByID)
    .delete('/:id', auth(), TestController.deleteTestByID)
    .patch(
        '/:id',
        auth('teacher'),
        upload.any(),
        (req: Request, res: Response, next: NextFunction) => {
            req.body = JSON.parse(req.body.data);
            next();
        },
        validateRequest(TestValidation.updateTestSchema),
        TestController.updateTest,
    )
    .put('/markAsComplete/:testId', auth(), TestController.testCompletion);

export const TestRoute = router;

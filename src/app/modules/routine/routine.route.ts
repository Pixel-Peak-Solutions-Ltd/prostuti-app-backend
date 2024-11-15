import express from 'express';
import { RoutineController } from './routine.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { RoutineValidation } from './routine.validation';



const router = express.Router();

router
    .post('/',auth(USER_ROLE.teacher),validateRequest(RoutineValidation.createRoutineSchema), RoutineController.createRoutine)
    .get('/',auth(), RoutineController.getAllRoutines)
    .get('/:id',auth(), RoutineController.getRoutineByID)
    .delete('/:id',auth(), RoutineController.deleteRoutineByID)
    .patch('/:id', RoutineController.updateRoutine);

export const RoutineRoute = router;
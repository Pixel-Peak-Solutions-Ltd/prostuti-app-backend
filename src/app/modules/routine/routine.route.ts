import express from 'express';
import { RoutineController } from './routine.controller';



const router = express.Router();

router
    .post('/', RoutineController.createRoutine)
    .get('/', RoutineController.getAllRoutines)
    .get('/:id', RoutineController.getRoutineByID)
    .delete('/:id', RoutineController.deleteRoutineByID)
    .patch('/:id', RoutineController.updateRoutine);

export const RoutineRoute = router;
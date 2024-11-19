import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendSuccessResponse from '../../utils/sendSuccessResponse';
import { RoutineService } from './routine.service';
import { TJWTDecodedUser } from '../../interfaces/jwt/jwt.type';
import { RoutineFilterableFields } from './routine.constant';
import { paginationFields } from '../../constant';
import pick from '../../helpers/pick';



const createRoutine = catchAsync(async (req: Request, res: Response) => {
    const result = await RoutineService.createRoutine(req.user as TJWTDecodedUser,req.body);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Routine created successfully',
        data: result,
    });
});

const getAllRoutines = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, RoutineFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);
    const result = await RoutineService.getAllRoutines(filters,paginationOptions,req.user as TJWTDecodedUser);


    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Routines are retrieved successfully',
        data: result,
    });
});

const getRoutineByID = catchAsync(async (req: Request, res: Response) => {
    const result = await RoutineService.getRoutineByID(req.params.id);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Single Routine retrieved successfully',
        data: result,
    });
});

const updateRoutine = catchAsync(async (req: Request, res: Response) => {
    const result = await RoutineService.updateRoutine();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Routine is updated successfully',
        data: result,
    });
});

const deleteRoutineByID = catchAsync(async (req: Request, res: Response) => {
    const result = await RoutineService.deleteRoutineByID(req.params.id,req.user as TJWTDecodedUser);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Routine is deleted successfully',
        data: result,
    });
});

export const RoutineController = {
    createRoutine,
    getAllRoutines,
    getRoutineByID,
    updateRoutine,
    deleteRoutineByID,
};

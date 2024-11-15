import { StatusCodes } from "http-status-codes";
import AppError from "../../classes/errorClasses/AppError";
import { TJWTDecodedUser } from "../../interfaces/jwt/jwt.type";
import { Routine } from "./rouitine.model";
import { IRoutine } from "./routine.interface";

const createRoutine = async (
    userInfo: TJWTDecodedUser,
    payload: Partial<IRoutine>,
): Promise<any> =>  {
    const newRoutine=new Routine({
        type:payload.type,
        date:payload.date && new Date(payload.date),
        createdBy: userInfo.userId,
    })
    const data=await newRoutine.save()
    if (!data) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Creation Failed');
    }
    return data
};

const getAllRoutines = async () => {
    return 'getAllRoutines service';
};

const getRoutineByID = async () => {
    return 'getRoutineByID service';
};

const updateRoutine = async () => {
    return 'updateRoutine service';
};

const deleteRoutineByID = async () => {
    return 'deleteRoutineByID service';
};

export const RoutineService = {
    createRoutine,
    getAllRoutines,
    getRoutineByID,
    updateRoutine,
    deleteRoutineByID,
};


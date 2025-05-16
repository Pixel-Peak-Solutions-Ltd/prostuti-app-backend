import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendSuccessResponse from "../../utils/sendSuccessResponse";
import { TeacherLogsService } from "./teacherLog.service";
import { Request, Response } from "express";
import pick from "../../helpers/pick";
import { teacherLogFilterableFields } from "./teacherLog.constant";
import { paginationFields } from "../../constant";

const getAllTeacherLogs = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, teacherLogFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);

    const result = await TeacherLogsService.getAllTeacherLogs(filters,paginationOptions,req.user);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'TeacherLogs are retrieved successfully',
        data: result,
    });
});

export const TeacherLogController = {
    
    getAllTeacherLogs,
    
};
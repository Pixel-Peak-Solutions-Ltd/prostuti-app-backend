import { StatusCodes } from "http-status-codes";
import sendSuccessResponse from "../../utils/sendSuccessResponse";
import catchAsync from "../../utils/catchAsync";
import { Request, Response } from "express";
import { EnrolledCourseService } from "./enrolledCourse.service";
import { TJWTDecodedUser } from "../../interfaces/jwt/jwt.type";

const createFreeEnrolledCourse = catchAsync(async (req: Request, res: Response) => {
    const result = await EnrolledCourseService.createFreeEnrolledCourse(req.user as TJWTDecodedUser,req.body)

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Successfully added to enrolled course',
        data: result,
    });
});

const createPaidEnrolledCourse = catchAsync(async (req: Request, res: Response) => {
    const result = await EnrolledCourseService.createPaidEnrolledCourse(req.user as TJWTDecodedUser,req.body)
   res.redirect(result)
});

export const EnrolledCourseController = {
   createFreeEnrolledCourse,createPaidEnrolledCourse
};
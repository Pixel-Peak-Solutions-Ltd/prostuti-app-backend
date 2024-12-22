import { StatusCodes } from "http-status-codes";
import sendSuccessResponse from "../../utils/sendSuccessResponse";
import catchAsync from "../../utils/catchAsync";
import { Request, Response } from "express";
import { EnrolledCourseService } from "./enrolledCourse.service";
import { TJWTDecodedUser } from "../../interfaces/jwt/jwt.type";
import AppError from "../../classes/errorClasses/AppError";
import config from "../../config";

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
    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Payment Redirect Link',
        data: result,
    });
});
const createPaidEnrolledCourseSuccess = catchAsync(async (req: Request, res: Response) => {
    const trans_id = req.query.trans_id as string;
    const courseIdString = req.query.course_id as string; 
     const course_id = courseIdString.split(',');

    
    if (!trans_id || !course_id) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Transaction ID  and courses id are required.');
    }
    await EnrolledCourseService.createPaidEnrolledCourseSuccess(req.user as TJWTDecodedUser,trans_id,course_id)
    res.redirect(`${config.frontend_url}/payment/success`)
})

const createPaidEnrolledCourseFailed = catchAsync(async (req: Request, res: Response) => {
    const trans_id = req.query.trans_id as string;

    
    if (!trans_id) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Transaction ID is required.');
    }
    await EnrolledCourseService.createPaidEnrolledCourseFailed(req.user as TJWTDecodedUser,trans_id)
    res.redirect(`${config.frontend_url}/payment/failed`)
})

const createPaidEnrolledCourseCanceled = catchAsync(async (req: Request, res: Response) => {
    const trans_id = req.query.trans_id as string;

    
    if (!trans_id) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Transaction ID is required.');
    }
    await EnrolledCourseService.createPaidEnrolledCourseCanceled(req.user as TJWTDecodedUser,trans_id)
    res.redirect(`${config.frontend_url}/payment/canceled`)
})

export const EnrolledCourseController = {
   createFreeEnrolledCourse,createPaidEnrolledCourse,createPaidEnrolledCourseSuccess,createPaidEnrolledCourseFailed,createPaidEnrolledCourseCanceled
};
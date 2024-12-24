import { StatusCodes } from "http-status-codes";
import sendSuccessResponse from "../../utils/sendSuccessResponse";
import catchAsync from "../../utils/catchAsync";
import { Request, Response } from "express";
import { EnrolledCourseService } from "./enrolledCourse.service";
import { TJWTDecodedUser } from "../../interfaces/jwt/jwt.type";
import AppError from "../../classes/errorClasses/AppError";
import config from "../../config";
import pick from "../../helpers/pick";
import { EnrolledCourseFilterableFields } from "./enrolledCourse.constant";
import { paginationFields } from "../../constant";

const createFreeEnrolledCourse = catchAsync(async (req: Request, res: Response) => {
    const result = await EnrolledCourseService.createFreeEnrolledCourse(req.user as TJWTDecodedUser,req.body)

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Successfully added to enrolled course',
        data: result,
    });
});const createSubscriptionEnrolledCourse = catchAsync(async (req: Request, res: Response) => {
    const result = await EnrolledCourseService.createSubscriptionEnrolledCourse(req.user as TJWTDecodedUser,req.body)

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
    await EnrolledCourseService.createPaidEnrolledCourseSuccess(trans_id,course_id)
    res.redirect(`${config.frontend_url}/payment/success`)
})

const createPaidEnrolledCourseFailed = catchAsync(async (req: Request, res: Response) => {
    const trans_id = req.query.trans_id as string;

    
    if (!trans_id) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Transaction ID is required.');
    }
    await EnrolledCourseService.createPaidEnrolledCourseFailed(trans_id)
    res.redirect(`${config.frontend_url}/payment/failed`)
})

const createPaidEnrolledCourseCanceled = catchAsync(async (req: Request, res: Response) => {
    const trans_id = req.query.trans_id as string;

    
    if (!trans_id) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Transaction ID is required.');
    }
    await EnrolledCourseService.createPaidEnrolledCourseCanceled(trans_id)
    res.redirect(`${config.frontend_url}/payment/canceled`)
})

const getAllEnrolledCourses = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, EnrolledCourseFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);
      const result = await EnrolledCourseService.getAllEnrolledCourses(filters,
          paginationOptions,
          req.user as TJWTDecodedUser);
  
      sendSuccessResponse(res, {
          statusCode: StatusCodes.OK,
          message: 'Enrolled Courses are retrieved successfully',
          data: result,
      });
  });
  const getEnrolledCourseByID = catchAsync(async (req: Request, res: Response) => {
    const result = await EnrolledCourseService.getEnrolledCourseByID(req.params.id,req.user as TJWTDecodedUser);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Single EnrolledCourse retrieved successfully',
        data: result,
    });
});

export const EnrolledCourseController = {
   createFreeEnrolledCourse,createSubscriptionEnrolledCourse,createPaidEnrolledCourse,createPaidEnrolledCourseSuccess,createPaidEnrolledCourseFailed,createPaidEnrolledCourseCanceled,getAllEnrolledCourses,getEnrolledCourseByID
};
import express, { Request, Response } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { USER_ROLE } from "../user/user.constant";
import { EnrolledCourseValidation } from "./EnrolledCourse.validation";
import { EnrolledCourseController } from "./enrolledCourse.controller";
import { v4 as uuidv4 } from 'uuid';

// @ts-ignore
import SSLCommerzPayment from "sslcommerz-lts"



const store_id = 'bakin62b84b547d1c3'
const store_passwd = 'bakin62b84b547d1c3@ssl'
const is_live = false 


const router = express.Router();

router.post('/free',auth(USER_ROLE.student),validateRequest(EnrolledCourseValidation.createFreeEnrolledCourse),EnrolledCourseController.createFreeEnrolledCourse )
router.post('/paid/init',auth(USER_ROLE.student),validateRequest(EnrolledCourseValidation.createPaidEnrolledCourse),EnrolledCourseController.createPaidEnrolledCourse )

router.post("/paid/success",EnrolledCourseController.createPaidEnrolledCourseSuccess)
router.post("/paid/failed",EnrolledCourseController.createPaidEnrolledCourseFailed)





export const EnrolledCourseRoute = router;
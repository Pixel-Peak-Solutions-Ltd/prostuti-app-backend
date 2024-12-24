import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { USER_ROLE } from "../user/user.constant";
import { EnrolledCourseValidation } from "./EnrolledCourse.validation";
import { EnrolledCourseController } from "./enrolledCourse.controller";



const router = express.Router();

router.post('/free',auth(USER_ROLE.student),validateRequest(EnrolledCourseValidation.createFreeEnrolledCourse),EnrolledCourseController.createFreeEnrolledCourse )
router.post('/subscription',auth(USER_ROLE.student),validateRequest(EnrolledCourseValidation.createSubscriptionEnrolledCourse),EnrolledCourseController.createSubscriptionEnrolledCourse )
router.post('/paid/init',auth(USER_ROLE.student),validateRequest(EnrolledCourseValidation.createPaidEnrolledCourse),EnrolledCourseController.createPaidEnrolledCourse )
router.post("/paid/success",EnrolledCourseController.createPaidEnrolledCourseSuccess)
router.post("/paid/failed",EnrolledCourseController.createPaidEnrolledCourseFailed)
router.post("/paid/canceled",EnrolledCourseController.createPaidEnrolledCourseCanceled)






export const EnrolledCourseRoute = router;
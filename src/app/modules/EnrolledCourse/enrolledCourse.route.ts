import express from "express";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../user/user.constant";
import validateRequest from "../../middlewares/validateRequest";
import { EnrolledCourseValidation } from "./EnrolledCourse.valdiation";
import { EnrolledCourseController } from "./enrolledCourse.controller";

const router = express.Router();

router.post('/free',auth(USER_ROLE.student),validateRequest(EnrolledCourseValidation.createFreeEnrolledCourse),EnrolledCourseController.createFreeEnrolledCourse )



export const EnrolledCourseRoute = router;
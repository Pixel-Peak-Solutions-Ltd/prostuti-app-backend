import express from "express";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../user/user.constant";
import { RevenueController } from "./revenue.controller";
const router = express.Router();

router.get("/sales-cost",auth(USER_ROLE.admin),RevenueController.SalesVsCostStats )
router.get("/gross-subscription-course",auth(USER_ROLE.admin),RevenueController.GrossSubscriptionCourseStats )


export const RevenueRoute = router;
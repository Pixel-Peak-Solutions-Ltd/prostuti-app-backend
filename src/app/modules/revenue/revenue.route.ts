import express from "express";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../user/user.constant";
import { RevenueController } from "./revenue.controller";
const router = express.Router();

router.get("/sales-cost",auth(USER_ROLE.admin),RevenueController.SalesVsCostStats )


export const RevenueRoute = router;
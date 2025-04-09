import express from "express";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../user/user.constant";
import validateRequest from "../../middlewares/validateRequest";
import { PaymentValidation } from "./payment.validation";
import { PaymentController } from "./payment.controller";

const router = express.Router();

router.post('/subscription/init',auth(USER_ROLE.student),validateRequest(PaymentValidation.createSubscriptionPayment),PaymentController.createSubscriptionPayment )
router.post("/subscription/success",PaymentController.createSubscriptionPaymentSuccess)
router.post("/subscription/failed",PaymentController.createSubscriptionPaymentFailed)
router.post("/subscription/canceled",PaymentController.createSubscriptionPaymentCanceled)


router.get("/all-payment",auth(),PaymentController.getAllPayments)
router.get("/:id",auth(),PaymentController.getPaymentByID)

export const PaymentRoute = router;
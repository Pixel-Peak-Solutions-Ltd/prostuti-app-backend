import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { PaymentService } from "./payment.service";
import { TJWTDecodedUser } from "../../interfaces/jwt/jwt.type";
import AppError from "../../classes/errorClasses/AppError";
import config from "../../config";
import { StatusCodes } from "http-status-codes";

const createSubscriptionPayment = catchAsync(async (req: Request, res: Response) => {
    const result = await PaymentService.createSubscriptionPayment(req.user as TJWTDecodedUser,req.body)
    res.redirect(result)
});
const createSubscriptionPaymentSuccess = catchAsync(async (req: Request, res: Response) => {
    const trans_id = req.query.trans_id as string;

    
    if (!trans_id) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Transaction ID is required.');
    }
    await PaymentService.createSubscriptionPaymentSuccess(req.user as TJWTDecodedUser,trans_id)
    res.redirect(`${config.frontend_url}/payment/success`)
})

const createSubscriptionPaymentFailed = catchAsync(async (req: Request, res: Response) => {
    const trans_id = req.query.trans_id as string;

    
    if (!trans_id) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Transaction ID is required.');
    }
    await PaymentService.createSubscriptionPaymentFailed(req.user as TJWTDecodedUser,trans_id)
    res.redirect(`${config.frontend_url}/payment/failed`)
})

const createSubscriptionPaymentCanceled = catchAsync(async (req: Request, res: Response) => {
    const trans_id = req.query.trans_id as string;

    
    if (!trans_id) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Transaction ID is required.');
    }
    await PaymentService.createSubscriptionPaymentCanceled(req.user as TJWTDecodedUser,trans_id)
    res.redirect(`${config.frontend_url}/payment/canceled`)
})

export const PaymentController = {
   createSubscriptionPayment,createSubscriptionPaymentSuccess,createSubscriptionPaymentFailed,createSubscriptionPaymentCanceled
};
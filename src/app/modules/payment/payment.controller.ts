import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { PaymentService } from './payment.service';
import { TJWTDecodedUser } from '../../interfaces/jwt/jwt.type';
import AppError from '../../classes/errorClasses/AppError';
import config from '../../config';
import { StatusCodes } from 'http-status-codes';
import sendSuccessResponse from '../../utils/sendSuccessResponse';
import pick from '../../helpers/pick';
import { PaymentFilterableFields } from './payment.constant';
import { paginationFields } from '../../constant';

const createSubscriptionPayment = catchAsync(
    async (req: Request, res: Response) => {
        const result = await PaymentService.createSubscriptionPayment(
            req.user as TJWTDecodedUser,
            req.body,
        );
        sendSuccessResponse(res, {
            statusCode: StatusCodes.OK,
            message: 'Payment Redirect Link',
            data: result,
        });
    },
);
const createSubscriptionPaymentSuccess = catchAsync(
    async (req: Request, res: Response) => {
        const trans_id = req.query.trans_id as string;
        const requestedPlan = req.query.requestedPlan as string;

        if (!trans_id || !requestedPlan) {
            throw new AppError(
                StatusCodes.BAD_REQUEST,
                'Transaction ID and required plan are required.',
            );
        }
        await PaymentService.createSubscriptionPaymentSuccess(
            trans_id,
            requestedPlan,
        );
        res.redirect(`${config.frontend_url}/payment/success`);
    },
);

const createSubscriptionPaymentFailed = catchAsync(
    async (req: Request, res: Response) => {
        const trans_id = req.query.trans_id as string;

        if (!trans_id) {
            throw new AppError(
                StatusCodes.BAD_REQUEST,
                'Transaction ID is required.',
            );
        }
        await PaymentService.createSubscriptionPaymentFailed(trans_id);
        res.redirect(`${config.frontend_url}/payment/failed`);
    },
);

const createSubscriptionPaymentCanceled = catchAsync(
    async (req: Request, res: Response) => {
        const trans_id = req.query.trans_id as string;

        if (!trans_id) {
            throw new AppError(
                StatusCodes.BAD_REQUEST,
                'Transaction ID is required.',
            );
        }
        await PaymentService.createSubscriptionPaymentCanceled(trans_id);
        res.redirect(`${config.frontend_url}/payment/canceled`);
    },
);

const getAllPayments = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, PaymentFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);
    const result = await PaymentService.getAllPayments(
        filters,
        paginationOptions,
    );

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Payments are retrieved successfully',
        data: result,
    });
});

const getPaymentByID = catchAsync(async (req: Request, res: Response) => {
    const result = await PaymentService.getPaymentByID(req.params.id);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Single Payment retrieved successfully',
        data: result,
    });
});

export const PaymentController = {
    createSubscriptionPayment,
    createSubscriptionPaymentSuccess,
    createSubscriptionPaymentFailed,
    createSubscriptionPaymentCanceled,
    getAllPayments,
    getPaymentByID,
};

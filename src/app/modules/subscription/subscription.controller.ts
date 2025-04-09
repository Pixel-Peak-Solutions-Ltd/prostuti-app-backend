import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { SubscriptionFilterableFields } from "./subscription.constant";
import { paginationFields } from "../../constant";
import sendSuccessResponse from "../../utils/sendSuccessResponse";
import { StatusCodes } from "http-status-codes";
import { SubscriptionService } from "./subscription.service";
import pick from "../../helpers/pick";

const getAllSubscriptions = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, SubscriptionFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);
    const result = await SubscriptionService.getAllSubscriptions(
        filters,
        paginationOptions,
    );

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Subscriptions are retrieved successfully',
        data: result,
    });
});

const getSubscriptionByID = catchAsync(async (req: Request, res: Response) => {
    const result = await SubscriptionService.getSubscriptionByID(req.params.id);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Single Subscription retrieved successfully',
        data: result,
    });
});

export const SubscriptionController = {
    getAllSubscriptions,
    getSubscriptionByID,
};
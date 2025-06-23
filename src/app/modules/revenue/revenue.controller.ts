import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendSuccessResponse from "../../utils/sendSuccessResponse";
import { StatusCodes } from "http-status-codes";
import { RevenueService } from "./revenue.service";


const SalesVsCostStats = catchAsync(
    async (req: Request, res: Response) => {
        const result = await RevenueService.SalesVsCostStats();
        sendSuccessResponse(res, {
            statusCode: StatusCodes.OK,
            message: 'Sales vs Cost Statistics',
            data: result,
        });
    },
);

export const RevenueController = {
    SalesVsCostStats,
};

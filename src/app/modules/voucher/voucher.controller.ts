import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendSuccessResponse from '../../utils/sendSuccessResponse';
import { VoucherService } from './voucher.service';



const createVoucher = catchAsync(async (req: Request, res: Response) => {
    const result = await VoucherService.createVoucher(req.user,req.body);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Voucher created successfully',
        data: result,
    });
});

const getAllVouchers = catchAsync(async (req: Request, res: Response) => {
    const result = await VoucherService.getAllVouchers();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Vouchers are retrieved successfully',
        data: result,
    });
});

const getVoucherByID = catchAsync(async (req: Request, res: Response) => {
    const result = await VoucherService.getVoucherByID();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Single Voucher retrieved successfully',
        data: result,
    });
});

const updateVoucher = catchAsync(async (req: Request, res: Response) => {
    const result = await VoucherService.updateVoucher();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Voucher is updated successfully',
        data: result,
    });
});

const deleteVoucherByID = catchAsync(async (req: Request, res: Response) => {
    const result = await VoucherService.deleteVoucherByID();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Voucher is deleted successfully',
        data: result,
    });
});

export const VoucherController = {
    createVoucher,
    getAllVouchers,
    getVoucherByID,
    updateVoucher,
    deleteVoucherByID,
};

import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendSuccessResponse from '../../utils/sendSuccessResponse';
import { VoucherService } from './voucher.service';
import pick from '../../helpers/pick';
import { VoucherFilterableFields } from './voucher.constant';
import { paginationFields } from '../../constant';



const createVoucher = catchAsync(async (req: Request, res: Response) => {
    const result = await VoucherService.createVoucher(req.user,req.body);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Voucher created successfully',
        data: result,
    });
});

const getAllVouchers = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, VoucherFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);
    const result = await VoucherService.getAllVouchers(filters,paginationOptions);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Vouchers are retrieved successfully',
        data: result,
    });
});

const getVoucherByID = catchAsync(async (req: Request, res: Response) => {
    const result = await VoucherService.getVoucherByID(req.params.id);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Single Voucher retrieved successfully',
        data: result,
    });
});

const updateVoucher = catchAsync(async (req: Request, res: Response) => {
    const result = await VoucherService.updateVoucher(req.params.id);

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

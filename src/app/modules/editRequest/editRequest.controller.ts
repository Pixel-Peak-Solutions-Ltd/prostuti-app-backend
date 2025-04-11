import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendSuccessResponse from '../../utils/sendSuccessResponse';
import { editRequestService } from './editRequest.service';
import pick from '../../helpers/pick';
import { paginationFields } from '../../constant';
import { NotificationFilterableFields } from '../notification/notification.constant';

// Request an edit to a resource
const requestEdit = catchAsync(async (req: Request, res: Response) => {
    const result = await editRequestService.requestEdit(req.user, req.body);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.CREATED,
        message: 'Edit request sent successfully',
        data: result,
    });
});

// Get all edit requests that I've sent (admin)
const getMyEditRequests = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, NotificationFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);

    const result = await editRequestService.getMyEditRequests(
        req.user,
        filters,
        paginationOptions
    );

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Edit requests retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
});

export const editRequestController = {
    requestEdit,
    getMyEditRequests,
};
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendSuccessResponse from '../../utils/sendSuccessResponse';
import { CategoryService } from './categroy.service';


const createCategory = catchAsync(async (req: Request, res: Response) => {
    const result = await CategoryService.createCategory();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Category created successfully',
        data: result,
    });
});

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
    const result = await CategoryService.getAllCategories();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Categories are retrieved successfully',
        data: result,
    });
});

const getCategoryByID = catchAsync(async (req: Request, res: Response) => {
    const result = await CategoryService.getCategoryByID();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Single Category retrieved successfully',
        data: result,
    });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
    const result = await CategoryService.updateCategory();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Category is updated successfully',
        data: result,
    });
});

const deleteCategoryByID = catchAsync(async (req: Request, res: Response) => {
    const result = await CategoryService.deleteCategoryByID();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Category is deleted successfully',
        data: result,
    });
});

export const CategoryController = {
    createCategory,
    getAllCategories,
    getCategoryByID,
    updateCategory,
    deleteCategoryByID,
};

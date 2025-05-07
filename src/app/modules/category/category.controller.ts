import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendSuccessResponse from '../../utils/sendSuccessResponse';
import { CategoryService } from './categroy.service';
import pick from '../../helpers/pick';
import { paginationFields } from '../../constant';
import {
    categoryChapterFilterableFields,
    categoryDivisionFilterableFields,
    categoryFilterableFields,
    categoryJobNameFilterableFields,
    categoryJobTypeFilterableFields,
    categoryLessonFilterableFields,
    categorySubjectFilterableFields,
    categoryTypeFilterableFields,
    categoryUnitFilterableFields,
    categoryUniversityNameFilterableFields,
    categoryUniversityTypeFilterableFields,
} from './category.constant';
import { TJWTDecodedUser } from '../../interfaces/jwt/jwt.type';
import { get } from 'http';

const createCategory = catchAsync(async (req: Request, res: Response) => {
    const result = await CategoryService.createCategory(
        req.user as TJWTDecodedUser,
        req.body,
    );

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Category created successfully',
        data: result,
    });
});

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, categoryFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);
    const result = await CategoryService.getAllCategories(
        filters,
        paginationOptions,
        req.user as TJWTDecodedUser,
    );

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Categories are retrieved successfully',
        data: result.data,
        meta: result.meta,
    });
});
const getAllCategoriesType = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, categoryTypeFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);
    const result = await CategoryService.getAllCategoriesType(
        filters,
        paginationOptions,
        req.user as TJWTDecodedUser,
    );

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Categories are retrieved successfully',
        data: result.data,
        meta: result.meta,
    });
});
const getAllCategoriesDivision = catchAsync(
    async (req: Request, res: Response) => {
        const filters = pick(req.query, categoryDivisionFilterableFields);
        const paginationOptions = pick(req.query, paginationFields);
        const result = await CategoryService.getAllCategoriesDivision(
            filters,
            paginationOptions,
            req.user as TJWTDecodedUser,
        );

        sendSuccessResponse(res, {
            statusCode: StatusCodes.OK,
            message: 'Categories are retrieved successfully',
            data: result.data,
            meta: result.meta,
        });
    },
);
const getAllCategoriesUniversityType = catchAsync(
    async (req: Request, res: Response) => {
        const filters = pick(req.query, categoryUniversityTypeFilterableFields);
        const paginationOptions = pick(req.query, paginationFields);
        const result = await CategoryService.getAllCategoriesUniversityType(
            filters,
            paginationOptions,
            req.user as TJWTDecodedUser,
        );

        sendSuccessResponse(res, {
            statusCode: StatusCodes.OK,
            message: 'Categories are retrieved successfully',
            data: result.data,
            meta: result.meta,
        });
    },
);
const getAllCategoriesUniversityName = catchAsync(
    async (req: Request, res: Response) => {
        const filters = pick(req.query, categoryUniversityNameFilterableFields);
        const paginationOptions = pick(req.query, paginationFields);
        const result = await CategoryService.getAllCategoriesUniversityName(
            filters,
            paginationOptions,
            req.user as TJWTDecodedUser,
        );

        sendSuccessResponse(res, {
            statusCode: StatusCodes.OK,
            message: 'Categories are retrieved successfully',
            data: result.data,
            meta: result.meta,
        });
    },
);
const getAllCategoriesUnit = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, categoryUnitFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);
    const result = await CategoryService.getAllCategoriesUnit(
        filters,
        paginationOptions,
        req.user as TJWTDecodedUser,
    );

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Categories are retrieved successfully',
        data: result.data,
        meta: result.meta,
    });
});

const getAllCategoriesJobType = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, categoryJobTypeFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);
    const result = await CategoryService.getAllCategoriesJobType(
        filters,
        paginationOptions,
        req.user as TJWTDecodedUser,
    );

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Job types are retrieved successfully',
        data: result.data,
        meta: result.meta,
    });
});
const getAllCategoriesJobName = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, categoryJobNameFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);
    const result = await CategoryService.getAllCategoriesJobName(
        filters,
        paginationOptions,
        req.user as TJWTDecodedUser,
    );

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Job names are retrieved successfully',
        data: result.data,
        meta: result.meta,
    });
});
const getAllCategoriesSubject = catchAsync(
    async (req: Request, res: Response) => {
        const filters = pick(req.query, categorySubjectFilterableFields);
        const paginationOptions = pick(req.query, paginationFields);
        const result = await CategoryService.getAllCategoriesSubject(
            filters,
            paginationOptions,
            req.user as TJWTDecodedUser,
        );

        sendSuccessResponse(res, {
            statusCode: StatusCodes.OK,
            message: 'Categories are retrieved successfully',
            data: result.data,
            meta: result.meta,
        });
    },
);
const getAllCategoriesChapter = catchAsync(
    async (req: Request, res: Response) => {
        const filters = pick(req.query, categoryChapterFilterableFields);
        const paginationOptions = pick(req.query, paginationFields);
        const result = await CategoryService.getAllCategoriesChapter(
            filters,
            paginationOptions,
            req.user as TJWTDecodedUser,
        );

        sendSuccessResponse(res, {
            statusCode: StatusCodes.OK,
            message: 'Categories are retrieved successfully',
            data: result.data,
            meta: result.meta,
        });
    },
);
const getAllCategoriesLesson = catchAsync(
    async (req: Request, res: Response) => {
        const filters = pick(req.query, categoryLessonFilterableFields);
        const paginationOptions = pick(req.query, paginationFields);
        const result = await CategoryService.getAllCategoriesLesson(
            filters,
            paginationOptions,
            req.user as TJWTDecodedUser,
        );

        sendSuccessResponse(res, {
            statusCode: StatusCodes.OK,
            message: 'Lessons are retrieved successfully',
            data: result.data,
            meta: result.meta,
        });
    },
);

const getCategoryByID = catchAsync(async (req: Request, res: Response) => {
    const result = await CategoryService.getCategoryByID(
        req.params.id,
        req.user as TJWTDecodedUser,
    );

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Single Category retrieved successfully',
        data: result,
    });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
    const result = await CategoryService.updateCategory(
        req.params.id,
        req.user as TJWTDecodedUser,
        req.body,
    );

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Category is updated successfully',
        data: result,
    });
});

const deleteCategoryByID = catchAsync(async (req: Request, res: Response) => {
    const result = await CategoryService.deleteCategoryByID(
        req.params.id,
        req.user as TJWTDecodedUser,
    );

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Category is deleted successfully',
        data: result._id,
    });
});

export const CategoryController = {
    createCategory,
    getAllCategories,
    getAllCategoriesType,
    getAllCategoriesDivision,
    getAllCategoriesUniversityType,
    getAllCategoriesUniversityName,
    getAllCategoriesUnit,
    getAllCategoriesJobType,
    getAllCategoriesJobName,
    getAllCategoriesSubject,
    getAllCategoriesChapter,
    getAllCategoriesLesson,
    getCategoryByID,
    updateCategory,
    deleteCategoryByID,
};

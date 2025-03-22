import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import sendSuccessResponse from '../../../utils/sendSuccessResponse';
import catchAsync from '../../../utils/catchAsync';
import { FlashcardService } from './flashcard.service';
import pick from '../../../helpers/pick';
import { flashcardFilterableFields } from './flashcard.constant';
import { paginationFields } from '../../../constant';



const createFlashcard = catchAsync(async (req: Request, res: Response) => {
    const result = await FlashcardService.createFlashcard(req.body,req.user);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Flashcard created successfully',
        data: result,
    });
});

const getAllFlashcards = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, flashcardFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);
    const result = await FlashcardService.getAllFlashcards(filters, paginationOptions,req.user);

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Flashcards are retrieved successfully',
        data: result,
    });
});

const getFlashcardByID = catchAsync(async (req: Request, res: Response) => {
    const result = await FlashcardService.getFlashcardByID();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Single Flashcard retrieved successfully',
        data: result,
    });
});

const updateFlashcard = catchAsync(async (req: Request, res: Response) => {
    const result = await FlashcardService.updateFlashcard();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Flashcard is updated successfully',
        data: result,
    });
});

const deleteFlashcardByID = catchAsync(async (req: Request, res: Response) => {
    const result = await FlashcardService.deleteFlashcardByID();

    sendSuccessResponse(res, {
        statusCode: StatusCodes.OK,
        message: 'Flashcard is deleted successfully',
        data: result,
    });
});

export const FlashcardController = {
    createFlashcard,
    getAllFlashcards,
    getFlashcardByID,
    updateFlashcard,
    deleteFlashcardByID,
};

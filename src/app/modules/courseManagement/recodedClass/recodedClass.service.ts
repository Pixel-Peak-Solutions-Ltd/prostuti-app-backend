import { StatusCodes } from 'http-status-codes';
import AppError from '../../../classes/errorClasses/AppError';
import { IRecodedClass } from './recodedClass.interface';
import { RecodedClass } from './recodedClass.model';

// Create Recoded Class
const createRecodedClass = async (payload: Partial<IRecodedClass>) => {
    const result = await RecodedClass.create({ ...payload });

    return result;
};

// Get All Recoded Class
const getAllRecodedClass = async () => {
    const result = await RecodedClass.find({});

    return result;
};

// Get Recoded Class By ID
const getRecodedClassByID = async (recodedClassId: string) => {
    const results = await RecodedClass.findById(recodedClassId);

    if (!results) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Course not found');
    }

    return results;
};

// Update Recoded Class
const updateRecodedClass = async (
    recodedClassId: string,
    payload: Partial<IRecodedClass>,
) => {
    // Check if there are fields to update
    if (Object.keys(payload).length === 0) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'No valid fields provided for update',
        );
    }

    // Check if the course exists
    const existingRecodedClass = await RecodedClass.findById(recodedClassId);
    if (!existingRecodedClass) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Course not found');
    }

    // Filter out the fields to update
    const updatedPayload: Partial<IRecodedClass> = {
        ...(payload.lessonName && { lessonName: payload.lessonName }),
        ...(payload.recodeClassName && {
            recodeClassName: payload.recodeClassName,
        }),
        ...(payload.classDate && { classDate: payload.classDate }),
        ...(payload.classDetails && { classDetails: payload.classDetails }),
        ...(payload.classVideoURL && { classVideoURL: payload.classVideoURL }),
    };

    // Update the record in the database
    const updatedRecodedClass = await RecodedClass.findByIdAndUpdate(
        recodedClassId,
        updatedPayload,
        { new: true, runValidators: true },
    );

    return updatedRecodedClass;
};

// Delete Recoded Class By ID
const deleteRecodedClassByID = async (recodedClassId: string) => {
    // Check if the course exists
    const existingCourse = await RecodedClass.findById(recodedClassId);
    if (!existingCourse) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Course not found');
    }

    // Delete the course from the database
    await RecodedClass.findByIdAndDelete(recodedClassId);

    return null;
};

export const recodedClassService = {
    createRecodedClass,
    getAllRecodedClass,
    getRecodedClassByID,
    updateRecodedClass,
    deleteRecodedClassByID,
};

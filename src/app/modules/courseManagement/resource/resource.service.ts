/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import { StatusCodes } from 'http-status-codes';
import AppError from '../../../classes/errorClasses/AppError';
import { IResources, TResource } from './resource.interface';
import { Express } from 'express';
import { deleteFromB2, uploadToB2 } from '../../../utils/backBlaze';
import config from '../../../config';
import { Resource } from './resource.model';
import fs from 'fs';
import { Course } from '../course/course.model';
import { Lesson } from '../lesson/lesson.model';

// Create Resources
const createResource = async (
    payload: Partial<IResources>,
    files: Express.Multer.File[] | [],
) => {
    // Check if the course exist
    const isCourseExist = await Course.findById(payload.course_id);
    if (!isCourseExist) {
        throw new AppError(
            StatusCodes.NOT_FOUND,
            'Course does not exist with this ID',
        );
    }

    // Check if the lesson exist
    const isLessonExist = await Lesson.findById(payload.lesson_id);
    if (!isLessonExist) {
        throw new AppError(
            StatusCodes.NOT_FOUND,
            'Lesson does not exist with this ID',
        );
    }

    // Check if the lesson belongs to of tah course
    const isLessonBelongsToCourse = await Lesson.findOne({
        _id: payload.lesson_id,
        course_id: payload.course_id,
    });

    if (!isLessonBelongsToCourse) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'The lesson does not belong to the course',
        );
    }

    // Check if the resources already added for this course under that lesson
    // const isResourcesAdded = await Resource.findOne({
    //     course_id: payload.course_id,
    //     lesson_id: payload.lesson_id,
    // });

    // if (isResourcesAdded) {
    //     throw new AppError(
    //         StatusCodes.BAD_REQUEST,
    //         'Already resource(s) added for this lesson',
    //     );
    // }

    // If no files were uploaded, throw an error
    if (!files.length) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'At least one file is required',
        );
    }

    // Upload all files to Backblaze
    const uploadPromises = files.map((file) =>
        uploadToB2(
            file,
            config.backblaze_all_users_bucket_name,
            config.backblaze_all_users_bucket_id,
            'courseResources', // folder path in B2
        ),
    );

    // Wait for all uploads to complete
    const uploadedFiles = await Promise.all(uploadPromises);

    // Create the resource document
    const resourceData: IResources = {
        course_id: payload.course_id!,
        lesson_id: payload.lesson_id!,
        name: payload.name as string,
        resourceDate: payload.resourceDate!,
        uploadFileResources: uploadedFiles.map((file) => ({
            diskType: file.diskType,
            path: file.path,
            originalName: file.originalName,
            modifiedName: file.modifiedName,
            fileId: file.fileId,
        })),
    };

    // Save to MongoDB
    const result = await Resource.create(resourceData);

    return result;
};

// GEt all Recoded classes of a Course with Lesson name
const getAllCourseResourcesWithLessons = async (courseId: string) => {
    // Check if the course exist
    const isCourseExist = await Course.findById(courseId);
    if (!isCourseExist) {
        throw new AppError(
            StatusCodes.NOT_FOUND,
            'Course does not exist with this ID',
        );
    }

    // Fetch resources and populate the lesson_id field
    const resources = await Resource.find({
        course_id: courseId,
    })
        .populate({
            path: 'lesson_id',
            select: 'number name',
            model: Lesson,
        })
        .select({ uploadFileResources: 1, name: 1, resourceDate: 1, isCompleted: true });

    return resources;
};

// Get All Resources
const getAllResource = async () => {
    const result = await Resource.find({});

    return result;
};

// Get Resources By ID
const getResourceByID = async (resourceId: string) => {
    const results = await Resource.findById(resourceId);

    if (!results) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Resources not found');
    }

    return results;
};

// UpdateR Resources
const updateResource = async (
    resourceId: string,
    payload: Partial<IResources>,
    files: Express.Multer.File[] | [],
) => {
    // Check if there are fields to update
    if (Object.keys(payload).length === 0) {
        // Delete local files if present
        if (files) {
            files.forEach((file) => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
        }

        // Throw Error
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            'No valid fields provided for update',
        );
    }

    // Check if the resource exists
    const existingResource = await Resource.findById(resourceId);
    if (!existingResource) {
        // Delete local files if present
        if (files) {
            files.forEach((file) => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
        }

        throw new AppError(StatusCodes.NOT_FOUND, 'Resource not found');
    }

    // Create the updated payload
    const updatedPayload: Partial<IResources> = {
        ...(payload.name && { name: payload.name }),
        ...(payload.resourceDate && {
            resourceDate: new Date(payload.resourceDate),
        }),
    };

    // Handle file uploads if present
    if (files.length > 0) {
        try {
            const uploadedResources: TResource[] = [];

            // Upload each new file
            for (const file of files) {
                const uploadedResource = await uploadToB2(
                    file,
                    config.backblaze_all_users_bucket_name,
                    config.backblaze_all_users_bucket_id,
                    'resources',
                );
                uploadedResources.push(uploadedResource);
            }

            // Combine existing and new upload resources
            updatedPayload.uploadFileResources = [
                ...(existingResource.uploadFileResources || []),
                ...uploadedResources,
            ];
        } catch (error) {
            // Clean up any remaining local files
            files.forEach((file) => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });

            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                'Failed to process file uploads',
            );
        }
    }

    // Update the resource
    const result = await Resource.findByIdAndUpdate(
        resourceId,
        updatedPayload,
        {
            new: true,
            runValidators: true,
        },
    );

    return result;
};

//mark resource as completed

const markResourceAsCompleted = async (resourceId: string) => {
    // Check if the resource exists
    const existingResource = await Resource.findById(resourceId);
    if (!existingResource) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Resource not found');
    };

    const markAsCompeted = await Resource.findByIdAndUpdate(
        resourceId,
        { isCompleted: true },
        { new: true },
    )

    return markAsCompeted;
}
// Delete Resources By ID
const deleteResourceByID = async (resourceId: string) => {
    // Check if the course exists
    const existingResource = await Resource.findById(resourceId);
    if (!existingResource) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Resource not found');
    }

    // Delete all associated files from Backblaze storage
    if (
        existingResource.uploadFileResources &&
        existingResource.uploadFileResources.length > 0
    ) {
        // Create an array of promises for parallel deletion
        const deletionPromises = existingResource.uploadFileResources.map(
            (resource) => {
                if (resource.fileId && resource.modifiedName) {
                    return deleteFromB2(
                        resource.fileId,
                        resource.modifiedName,
                        'courseCoverImage',
                    ).catch((error) => {
                        console.error(
                            `Failed to delete resource file ${resource.modifiedName}`,
                        );
                        // We don't throw here to allow other deletions to continue
                        return null;
                    });
                }
                return Promise.resolve(null);
            },
        );

        // Wait for all file deletions to complete
        await Promise.all(deletionPromises);
    }

    // Delete the resource from the database
    await Resource.findByIdAndDelete(resourceId);

    return null;
};

export const resourceService = {
    createResource,
    getAllCourseResourcesWithLessons,
    getAllResource,
    getResourceByID,
    updateResource,
    deleteResourceByID,
    markResourceAsCompleted
};

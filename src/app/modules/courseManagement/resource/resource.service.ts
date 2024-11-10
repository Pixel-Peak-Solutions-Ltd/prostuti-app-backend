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

// Create Resources
const createResource = async (
    payload: Partial<IResources>,
    files: Express.Multer.File[] | [],
) => {
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
        name: payload.name as string,
        resourceDate: payload.resourceDate || new Date(),
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
    getAllResource,
    getResourceByID,
    updateResource,
    deleteResourceByID,
};

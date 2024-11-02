/* eslint-disable no-console */
import B2 from 'backblaze-b2';
import fs from 'fs';
import config from '../config';
import { Express } from 'express';
import { TImage } from '../modules/teacher/teacher.interface';
import AppError from '../classes/errorClasses/AppError';
import { StatusCodes } from 'http-status-codes';

const b2 = new B2({
    applicationKeyId: config.backblaze_key_id,
    applicationKey: config.backblaze_app_key,
});

export const uploadToB2 = async (
    file: Express.Multer.File,
    bucketName: string,
): Promise<TImage> => {
    try {
        // Authenticate with B2
        await b2.authorize();

        // Get upload URL
        const {
            data: { uploadUrl, authorizationToken },
        } = await b2.getUploadUrl({
            bucketId: config.backblaze_bucket_id,
        });

        // Read file
        const fileData = fs.readFileSync(file.path);

        // Upload file
        const response = await b2.uploadFile({
            uploadUrl: uploadUrl,
            uploadAuthToken: authorizationToken,
            fileName: file.filename,
            data: fileData,
            mime: file.mimetype,
        });

        // Create image object
        const image: TImage = {
            diskType: file.mimetype,
            path: `https://f004.backblazeb2.com/file/${bucketName}/${response.data.fileName}`,
            originalName: file.originalname,
            modifiedName: file.filename,
            fileId: response.data.fileId, // Store fileId for future deletion
        };

        // Delete local file after upload
        fs.unlinkSync(file.path);

        return image;
    } catch (error) {
        // Delete local file if upload fails
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
        throw new AppError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            'Failed to upload new image to storage',
        );
    }
};

// Function to delete file from B2
export const deleteFromB2 = async (
    fileId: string,
    fileName: string,
): Promise<void> => {
    try {
        // Authenticate with B2
        await b2.authorize();

        // Delete file using fileId
        await b2.deleteFileVersion({
            fileId: fileId,
            fileName,
        });
    } catch (error) {
        // Log the error but don't throw it
        console.error('Error deleting file from B2:', error);
        // We're not throwing here because we don't want to disrupt the main flow
    }
};

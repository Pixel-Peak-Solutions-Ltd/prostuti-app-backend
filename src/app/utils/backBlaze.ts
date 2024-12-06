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
    applicationKey: config.backblaze_application_key,
});

export const uploadToB2 = async (
    file: Express.Multer.File,
    bucketName: string,
    bucketId: string,
    folderPath: string = '',
): Promise<TImage> => {
    try {
        // Authenticate with B2
        await b2.authorize();

        // Get upload URL
        const {
            data: { uploadUrl, authorizationToken },
        } = await b2.getUploadUrl({
            bucketId: bucketId,
        });

        // Read file
        const fileData = fs.readFileSync(file.path);

        // Create the full file path including folder
        const fullFileName = folderPath
            ? `${folderPath.replace(/^\/+|\/+$/g, '')}/${file.filename}` // Remove leading/trailing slashes
            : file.filename;

        // Upload file
        const response = await b2.uploadFile({
            uploadUrl: uploadUrl,
            uploadAuthToken: authorizationToken,
            fileName: fullFileName, // Use the full path with folder
            data: fileData,
            mime: file.mimetype,
        });

        // url: https://all-users.s3.us-west-004.backblazeb2.com/courseCoverImage/6724fd912384ed2d3c261310-1732730283929-64779474-5-ways-to-improve-your-course-cover-design-1024x575.png
        // Create image object
        const image: TImage = {
            diskType: file.mimetype,
            // path: `https://f004.backblazeb2.com/file/${bucketName}/${fullFileName}`,
            path: `https://${bucketName}.s3.us-west-004.backblazeb2.com/${fullFileName}`,
            originalName: file.originalname,
            modifiedName: file.filename,
            fileId: response.data.fileId,
        };

        // Delete local file after upload
        fs.unlinkSync(file.path);

        return image;
    } catch (error) {
        // Delete local file if upload fails
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
        console.log(error);
        throw new AppError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            'Failed to upload new image to storage',
        );
    }
};

// Also update the delete function to handle folders
export const deleteFromB2 = async (
    fileId: string,
    fileName: string,
    folderPath: string = '', // New parameter for folder path
): Promise<void> => {
    try {
        // Authenticate with B2
        await b2.authorize();

        // Create the full file path including folder
        const fullFileName = folderPath
            ? `${folderPath.replace(/^\/+|\/+$/g, '')}/${fileName}`
            : fileName;

        // Delete file using fileId
        await b2.deleteFileVersion({
            fileId: fileId,
            fileName: fullFileName,
        });
    } catch (error) {
        // Log the error but don't throw it
        console.error('Error deleting file from B2');
    }
};

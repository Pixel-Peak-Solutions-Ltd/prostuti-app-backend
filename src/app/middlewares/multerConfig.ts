import multer from 'multer';
import { Request, Express } from 'express';
import { any } from 'zod';

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const formattedFileName = file.originalname
            .replace(/\s/g, '-')
            .toLowerCase();
        cb(
            null,
            req.user.userId + '-' + uniqueSuffix + '-' + formattedFileName,
        );
    },
});

const allowedMimeTypes = [
    'image/png',
    'image/jpg',
    'image/jpeg',
    'application/pdf',
    'application/x-pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'video/mp4',
    'video/x-msvideo',
    'video/x-matroska',
    'video/quicktime',
    'video/x-ms-wmv',
];

const multerConfig = {
    storage: storage,
    limits: { fileSize: 500 * 1024 * 1024 }, // Increased to 50MB for video uploads
    fileFilter: (
        req: Request,
        file: Express.Multer.File,
        cb: multer.FileFilterCallback,
    ) => {
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    'Invalid file type. Only jpg, png, jpeg, pdf, doc, docx, xls, xlsx, ppt, pptx, and common video files are allowed',
                ),
            );
        }
    },
};

const uploadMiddleware = multer(multerConfig);

export const upload = {
    single: (fieldName: string) => uploadMiddleware.single(fieldName),
    multiple: (fieldName: string, maxCount: number = 10) =>
        uploadMiddleware.array(fieldName, maxCount),
    any: () => uploadMiddleware.any(),
};

import multer from 'multer';
import { Request, Express } from 'express';

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(
            null,
            req.user.userId + '-' + uniqueSuffix + '-' + file.originalname,
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
];

const multerConfig = {
    storage: storage,
    limits: { fileSize: 15 * 1024 * 1024 },
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
                    'Invalid file type. Only jpg, png, jpeg, pdf, doc, docx, xls, xlsx, ppt, and pptx files are allowed',
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
};

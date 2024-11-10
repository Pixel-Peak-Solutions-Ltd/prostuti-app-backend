import multer from 'multer';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // # This part defines where the files need to be saved
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        // # This part sets the file name of the file
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
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
];

export const upload = multer({
    storage: storage,
    limits: { fileSize: 15 * 1024 * 1024 }, //file size is in bytes-here the maximum limit is 5mb
    // image file validation
    fileFilter: (req, file, cb) => {
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only jpg, png and jpeg files are supported'));
        }
    },
});

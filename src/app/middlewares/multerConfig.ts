import multer from "multer"

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // # This part defines where the files need to be saved
        cb(null, './uploads')
    },
    filename: (req, file, cb) => {
        // # This part sets the file name of the file
        cb(null, req.user.userId + file.originalname)
    }
})

export const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, //file size is in bytes-here the maximum limit is 5mb
    // image file validation
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
            cb(null, true);
        } else {
            cb(new Error('Only jpg, png and jpeg files are supported'))
        }
    }
});
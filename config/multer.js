const multer = require('multer');
const path = require('path');

// Bộ nhớ tạm thời cho avatar
const avatarStorage = multer.memoryStorage();

// Bộ lọc file để chỉ cho phép các định dạng ảnh
const avatarFileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
        return cb(null, true);
    }
    cb('Error: Only images are allowed!');
};

// Bộ nhớ tạm thời cho video
const videoStorage = multer.memoryStorage();

// Bộ lọc file để chỉ cho phép các định dạng video
const videoFileFilter = (req, file, cb) => {
    const filetypes = /mp4|mov|avi/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
        return cb(null, true);
    }
    cb('Error: Only videos are allowed!');
};

// Cấu hình multer cho avatar
const uploadAvatar = multer({
    storage: avatarStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn kích thước file là 5MB
    fileFilter: avatarFileFilter
});

// Cấu hình multer cho video
const uploadVideo = multer({
    storage: videoStorage,
    limits: { fileSize: 10 * 1024 * 1024 * 1024 }, // Giới hạn kích thước file là 10GB
    fileFilter: videoFileFilter
});

// Bộ nhớ tạm thời cho ảnh
const imageStorage = multer.memoryStorage();

// Bộ lọc file để chỉ cho phép các định dạng ảnh
const imageFileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
        return cb(null, true);
    }
    cb('Error: Only images are allowed!');
};

// Cấu hình multer cho ảnh
const uploadImages = multer({
    storage: imageStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn kích thước file là 5MB
    fileFilter: imageFileFilter
});

module.exports = {
    uploadAvatar,
    uploadVideo,
    uploadImages
};

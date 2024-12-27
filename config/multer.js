const multer = require('multer');
const path = require('path');

// Bộ nhớ tạm thời (RAM)
const storage = multer.memoryStorage();

// Bộ lọc file tổng hợp
const fileFilter = (req, file, cb) => {
    const avatarFileTypes = /jpeg|jpg|png/; // Định dạng cho ảnh
    const videoFileTypes = /mp4|mov|avi/;  // Định dạng cho video

    // Kiểm tra tên trường
    if (file.fieldname === 'avatar' || file.fieldname === 'thumbnail_url' || file.fieldname === 'cover_image') {
        const isImage = avatarFileTypes.test(file.mimetype) && avatarFileTypes.test(path.extname(file.originalname).toLowerCase());
        if (isImage) {
            return cb(null, true);
        }
        return cb(new Error('Error: Only images are allowed for avatar/thumbnail/cover_image!'));
    } else if (file.fieldname === 'media_url') {
        const isVideo = videoFileTypes.test(file.mimetype) && videoFileTypes.test(path.extname(file.originalname).toLowerCase());
        if (isVideo) {
            return cb(null, true);
        }
        return cb(new Error('Error: Only videos are allowed for media!'));
    }

    // Nếu không khớp với các trường hợp trên
    cb(new Error('Error: Invalid field name!'));
};

// Giới hạn kích thước file
const limits = {
    fileSize: 1024 * 1024 * 1024 // 1GB, có thể điều chỉnh nếu cần
};

// Cấu hình multer
const upload = multer({ storage, fileFilter, limits });

// Cấu hình cho từng loại file
const uploadAvatar = upload.single('avatar'); // Upload 1 ảnh cho avatar
const upLoadCoverImage = upload.single('cover_image'); // Upload 1 ảnh cho avatar
const uploadVideo = upload.single('media_url'); // Upload 1 video cho media_url
const uploadImages = upload.single('thumbnail_url'); // Upload 1 ảnh cho thumbnail

// Cấu hình cho upload đa trường
const uploadMulti = upload.fields([
    { name: 'avatar', maxCount: 1 },          // Tối đa 1 file ảnh đại diện
    { name: 'media_url', maxCount: 1 },       // Tối đa 1 file video
    { name: 'thumbnail_url', maxCount: 1 },
    { name: 'cover_image', maxCount: 1 }// Tối đa 1 file ảnh thu nhỏ
]);

// Export tất cả cấu hình
module.exports = {
    uploadAvatar,
    uploadVideo,
    uploadImages,
    uploadMulti
};

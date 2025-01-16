const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const avatarFileTypes = /jpeg|jpg|png/;
    const videoFileTypes = /mp4|mov|avi/;

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

    cb(new Error('Error: Invalid field name!'));
};

const limits = {
    fileSize: 1024 * 1024 * 1024
};

const upload = multer({ storage, fileFilter, limits });

const uploadAvatar = upload.single('avatar');
const upLoadCoverImage = upload.single('cover_image');
const uploadVideo = upload.single('media_url');
const uploadImages = upload.single('thumbnail_url');

const uploadMulti = upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'media_url', maxCount: 1 },
    { name: 'thumbnail_url', maxCount: 1 },
    { name: 'cover_image', maxCount: 1 }
]);

module.exports = {
    uploadAvatar,
    upLoadCoverImage,
    uploadVideo,
    uploadImages,
    uploadMulti
};

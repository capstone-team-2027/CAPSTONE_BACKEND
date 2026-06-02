const multer = require("multer");
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file && file.mimetype && (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf")) {
        return cb(null, true);
    }
    cb(new Error("Chỉ cho phép tải lên file ảnh và file PDF!"), false);
};

const warrantyUpload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
});

module.exports = warrantyUpload;

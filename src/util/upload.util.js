const multer = require("multer");
const storage = multer.memoryStorage();


const fileFilter = (req, file, cb) => {
    if (file && file.mimetype && file.mimetype.startsWith("image/")) {
        return cb(null, true);
    }
    cb(new Error("Only image files are allowed"), false);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
    },
});

module.exports = upload;
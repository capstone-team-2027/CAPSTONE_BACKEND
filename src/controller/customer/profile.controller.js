const profileService = require("../../service/customer/profile.service");
const { updateProfileSchema } = require("../../validation/customer/profile.validation");
const db = require("../../../models");
/** @type {import("sequelize").ModelStatic<import("sequelize").Model>} */
const User = db.User;
const cloudinary = require("../../config/cloudinary.config");
const streamifier = require("streamifier");

module.exports.getProfile = async (req, res) => {
    try {
        const requestUser = res.locals.user;
        if (!requestUser) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const result = await profileService.getProfile(requestUser.id);
        return res.status(200).json({ message: "Lấy thông tin thành công", data: result });
    } catch (error) {
        return res.status(error.status || 500).json({ message: error.message || "Internal server error" });
    }
};

module.exports.updateProfile = async (req, res) => {
    try {
        const requestUser = res.locals.user;
        if (!requestUser) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { fullName, avatar } = req.body;

        const payloadToValidate = {};
        if (typeof fullName === "string" && fullName.trim().length > 0) {
            payloadToValidate.fullName = fullName;
        }
        if (typeof avatar === "string" && avatar.trim().length > 0) {
            payloadToValidate.avatar = avatar;
        }

        const validation = updateProfileSchema.safeParse(payloadToValidate);
        if (!validation.success) {
            return res.status(400).json({ message: validation.error.issues[0].message });
        }

        if (!validation.data.fullName && !validation.data.avatar && !req.file) {
            return res.status(400).json({ message: "Vui lòng cung cấp tên hoặc avatar" });
        }

        let avatarData = validation.data.avatar ?? null;
        if (req.file) {
            try {
                const uploadResult = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: "WDP301" },
                        (error, result) => {
                            if (error) return reject(error);
                            resolve(result);
                        }
                    );
                    streamifier.createReadStream(req.file.buffer).pipe(stream);
                });

                if (!uploadResult?.secure_url) {
                    return res.status(400).json({ message: "Upload avatar thất bại" });
                }

                avatarData = uploadResult.secure_url;
            } catch (err) {
                console.error("CLOUDINARY ERROR:", err);
                return res.status(500).json({ message: "Lỗi upload avatar" });
            }
        }

        const payload = {};
        if (validation.data.fullName) payload.fullName = validation.data.fullName;
        if (avatarData) payload.avatar = avatarData;

        const result = await profileService.updateProfile(requestUser.id, payload);

        return res.status(200).json({ message: "Cập nhật thông tin thành công", data: result });
    } catch (error) {
        return res.status(error.status || 500).json({ message: error.message || "Internal server error" });
    }
};

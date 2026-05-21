const db = require("../../../models");
const User = db.User;
const { normalizeVnPhone } = require("../../util/phone.util");
const { uploadAvatar } = require("../../util/upload.util");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
module.exports.getProfile = async (userId) => {
    const user = await User.findOne({
        where: { id: userId },
        attributes: { exclude: ["password", "refreshToken"] },
        include: [
            {
                model: db.Role,
                as: "role",
            },
        ],
    });

    if (!user) {
        throw { status: 404, message: "Người dùng không tồn tại" };
    }

    return user;
};


module.exports.updateProfile = async (userId, payload) => {
    const user = await User.findByPk(userId);
    if (!user) {
        throw { status: 404, message: "Người dùng không tồn tại" };
    }

    const updates = {};
    if (payload.fullName) updates.fullName = payload.fullName;
    if (payload.avatar) {
        updates.avatar = payload.avatar;
    }

    await user.update(updates);

    const updated = await User.findOne({
        where: { id: userId },
        attributes: { exclude: ["password"] },
        include: [
            {
                model: db.Role,
                as: "role",
            },
        ],
    });

    return updated;
};
module.exports.changePassword = async (
    userId,
    currentPassword,
    newPassword,
) => {
    if (!userId) {
        throw { status: 401, message: "Unauthorized" };
    }

    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
        throw { status: 404, message: "User not found" };
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        throw { status: 400, message: "Mật khẩu hiện tại không đúng" };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.refreshToken = null;
    await user.save();

    return { message: "Đổi mật khẩu thành công" };
};
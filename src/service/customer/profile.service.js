const db = require("../../../models");
const User = db.User;
const { normalizeVnPhone } = require("../../util/phone.util");
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
    if (payload.email) {
        updates.email = payload.email;
    }
    if (payload.phoneNumber) {
        updates.phoneNumber = payload.phoneNumber;
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

module.exports.updateLocation = async (userId, latitude, longitude) => {
    if (!userId) {
        throw { status: 401, message: "Unauthorized" };
    }

    const user = await User.findByPk(userId);
    if (!user) {
        throw { status: 404, message: "Người dùng không tồn tại" };
    }

    if (latitude !== undefined) user.latitude = latitude;
    if (longitude !== undefined) user.longitude = longitude;
    
    await user.save();

    // Đồng bộ toạ độ mới sang bảng Rescue_Requests nếu Khách hàng đang có cuốc cứu hộ chưa hoàn thành
    if (latitude !== undefined && longitude !== undefined) {
        const customer = await db.Customers.findOne({ where: { user_id: userId } });
        if (customer) {
            await db.Rescue_Requests.update(
                { customer_lat: latitude, customer_lng: longitude },
                {
                    where: {
                        customer_id: customer.id,
                        status: {
                            [Op.in]: ['PENDING', 'ASSIGNED', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS']
                        }
                    }
                }
            );
        }
    }

    return { message: "Cập nhật vị trí thành công" };
};
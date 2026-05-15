const db = require("../../../models");
/** @type {import("sequelize").ModelStatic<import("sequelize").Model>} */
const User = db.User;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")
module.exports.login = async (phone, password) => {
    const user = await User.findOne({
        where: {
            phoneNumber: phone
        },
        include: [
            {
                model: db.Role,
                as: "role"
            }
        ]
    });
    if (!user) {
        return res.status(404).json({
            message: "Sdt hoặc Mật khẩu bị sai "
        })
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(404).json({
            message: "Sdt hoặc Mật khẩu bị sai "
        })
    }
    const accessToken = jwt.sign(
        {
            id: user.id,
            roleId: user.roleId
        },
        process.env.ACCESSTOKEN_KEY,
        {
            expiresIn: process.env.ACCESSTOKEN_ExpiresIn,
        }
    );
    const refreshToken = jwt.sign(
        {
            id: user.id
        },
        process.env.Refresh_Token,
        {
            expiresIn: process.env.REFESHTOKEN_ExpiresIn,
        }
    );
    user.refreshToken = refreshToken;
    await user.save();
    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            fullName: user.fullName,
            phoneNumber: user.phoneNumber,
            role: user.role?.roleName,
            avatar: user.avatar
        }
    };
};
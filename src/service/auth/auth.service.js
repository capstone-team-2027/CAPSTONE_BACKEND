const db = require("../../../models");
/** @type {import("sequelize").ModelStatic<import("sequelize").Model>} */
const User = db.User;
const Role = db.Role;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")
const { where } = require("sequelize");
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
        throw {
            status: 404,
            message: "Số điện thoại hoặc Mật khẩu bị sai"
        };
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw {
            status: 404,
            message: "Số điện thoại hoặc Mật khẩu bị sai"
        };
    }
    const accessToken = jwt.sign(
        {
            id: user.id,
            roleId: user.roleId
        },
        process.env.ACCESS_TOKEN_KEY,
        {
            expiresIn: process.env.ACCESSTOKEN_ExpiresIn,
        }
    );
    const refreshToken = jwt.sign(
        {
            id: user.id
        },
        process.env.REFRESH_TOKEN_KEY,
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
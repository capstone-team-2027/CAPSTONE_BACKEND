const db = require("../../../models");
/** @type {import("sequelize").ModelStatic<import("sequelize").Model>} */
const User = db.User;
const Role = db.Role;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const axios = require('axios');
const { normalizeVnPhone } = require("../../util/phone.util");
const { where } = require("sequelize");
const admin = require("../../config/firebase.config");

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

module.exports.checkPhone = async (phone) => {
    const normalizePhone = await normalizeVnPhone(phone);
    if (!normalizePhone) {
        throw {
            status: 400,
            message: "Số điện thoại không hợp lệ, vui lòng thử lại"
        };
    }; 
    const user = await User.findOne({
        where: {phoneNumber: normalizePhone}
    });
    if (user && user.status == "ACTIVE"){
         throw {
            status: 400,
            message: "Người dùng đã tồn tại, vui lòng đăng nhập"
        };
    }
};


module.exports.register = async (idToken, fullName, password, confirmPassword) => {
    let decoded;
    try {
         decoded = await admin.auth().verifyIdToken(idToken);
         console.log("token: ",decoded)
    } catch (error) {
          console.log("VERIFY ERROR:", error);
        throw {
        status: 401,
        message: "OTP không hợp lệ hoặc đã hết hạn"
        };
    };
    const firebasePhoneNumber = decoded.phone_number;
    if(!firebasePhoneNumber) {
        throw {
        status: 400,
        message: "Token không chứa số điện thoại"
        };
    }
    const normalizePhone = await normalizeVnPhone(firebasePhoneNumber);
    if (!normalizePhone) {
        throw {
            status: 400,
            message: "Số điện thoại không hợp lệ, vui lòng thử lại"
        };
    };
    if (password !== confirmPassword ) {
        throw {
            status: 400,
            message: "Mật khẩu xác nhận không trùng khớp"
        };
    };
    const existingUser = await User.findOne({
        where: { phoneNumber: normalizePhone }
    }
    );
    if (existingUser && existingUser.status == "ACTIVE") {
        throw {
            status: 400,
            message: "Số điện thoại đã được đăng kí."
        };
    };
    const role = await Role.findOne({ where: { roleCode: "CUSTOMER" } });
    if (!role) {
        throw {
            status: 400,
            message: "Không tìm thấy vai trò trong db"
        };
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        fullName: fullName,
        phoneNumber: normalizePhone,
        password: hashPassword,
        status: "ACTIVE",
        roleId: role.id
    });
    return user;
};


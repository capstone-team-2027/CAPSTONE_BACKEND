
const { loginSchema, registerSchema } = require("./../../validation/auth.validation")
const authService = require("./../../service/auth/auth.service");
const { da } = require("zod/v4/locales");

module.exports.login = async (req, res) => {
    try {
        const { phone, password } = req.body;
        const validation = loginSchema.safeParse({ phone, password });
        const result = await authService.login(phone, password);
        return res.status(200).json({
            message: "Đăng nhập thành công",
            data: result
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            message: error.message || "Internal server error"
        });
    }
};


module.exports.register = async (req,res) => {
    try {
        const {fullName, phone, password, confirmPassword} = req.body;
        const validation = registerSchema.safeParse({fullName, phone, password});
        const result = await authService.register(fullName, phone, password, confirmPassword)
        return res.status(200).json({
            message: "Đăng kí thành công",
            data: result
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            message: error.message || "Internal server error"
        });
    }
};


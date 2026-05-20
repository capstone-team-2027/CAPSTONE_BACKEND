const { loginSchema, registerSchema, checkPhoneSchema } = require("./../../validation/auth/auth.validation")
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

module.exports.checkPhone = async (req,res) => {
    try {
        const {phone} = req.body;
        const validation = checkPhoneSchema.safeParse({phone});
        await authService.checkPhone(phone);
         return res.status(200).json({
            message: "",
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            message: error.message || "Internal server error"
        });
    }
}

module.exports.register = async (req,res) => {
    try {
        const {idToken, fullName, password, confirmPassword} = req.body;
        const validation = registerSchema.safeParse({fullName, password});
        if (!validation.success) {
            return res.status(400).json({
                message: validation.error.issues[0].message
            });
        }
        const result = await authService.register(idToken, fullName, password, confirmPassword)
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


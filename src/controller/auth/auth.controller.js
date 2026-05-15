
const { loginSchema } = require("./../../validation/auth.validation")
const authService = require("./../../service/auth/auth.service")
module.exports.login = async (req, res) => {
    try {
        const { phone, password } = req.body;
        const validation = loginSchema.safeParse({ phone, password });
        const result = await authService.login(phone, password);
        return res.status(200).json({
            message: "Login success",
            data: result
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            message: error.message || "Internal server error"
        });
    }
};

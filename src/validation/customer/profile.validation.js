const { z } = require("zod");

const updateProfileSchema = z.object({
    fullName: z
        .string({ required_error: "Họ Tên phải là chuỗi" })
        .min(2, "Họ tên phải có ít nhất 2 ký tự")
        .max(150, "Họ tên quá dài")
        .optional(),
    email: z
        .string({ required_error: "Email phải là chuỗi" })
        .email("Email không hợp lệ")
        .optional(),
    phone: z
        .string({ required_error: "Số điện thoại phải là chuỗi" })
        .trim()
        .regex(/^[0-9]{10,15}$/, "Số điện thoại không hợp lệ")
        .optional(),
    otpCode: z
        .string({ required_error: "Mã OTP phải là chuỗi" })
        .trim()
        .length(6, "Mã OTP phải có 6 chữ số")
        .optional(),
    avatar: z
        .string({ required_error: "Avatar phải là chuỗi" })
        .optional(),
});

module.exports = { updateProfileSchema };

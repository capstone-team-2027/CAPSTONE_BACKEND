const { z } = require("zod");
const { register } = require("../../service/auth/auth.service");

const loginSchema = z.object({
  phone: z
    .string({ required_error: "Số điện thoại là bắt buộc" })
    .min(10, "Số điện thoại phải có ít nhất 10 số")
    .max(15, "Số điện thoại quá dài")
    .regex(/^[0-9]+$/, "Số điện thoại chỉ được chứa ký tự số"),
  password: z
    .string({ required_error: "Mật khẩu là bắt buộc" })
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

const checkPhoneSchema =  z.object({
    phone: z
        .string({ required_error: "Số điện thoại là bắt buộc" })
        .min(10, "Số điện thoại phải có ít nhất 10 số")
        .max(15, "Số điện thoại quá dài")
        .regex(/^[0-9]+$/, "Số điện thoại chỉ được chứa ký tự số"),
});

const registerSchema = z.object({
    fullName: z 
        .string({ required_error: "Họ Tên là bắt buộc" })
        .min(1,"Họ tên phải có ít nhất 1 kts tự"),
    password: z
        .string({ required_error: "Mật khẩu là bắt buộc" })
        .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
});

module.exports = { loginSchema,checkPhoneSchema,registerSchema  };
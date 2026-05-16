const { z } = require("zod");
const { register } = require("../service/auth/auth.service");

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

const registerSchema = z.object({
  fullName: z
    .string({ required_error: "Họ Tên là bắt buộc" })
    .min(1, "Họ tên phải có ít nhất 1 kts tự"),
  phone: z
    .string({ required_error: "Số điện thoại là bắt buộc" })
    .min(10, "Số điện thoại phải có ít nhất 10 số")
    .max(15, "Số điện thoại quá dài")
    .regex(/^[0-9]+$/, "Số điện thoại chỉ được chứa ký tự số"),
  password: z
    .string({ required_error: "Mật khẩu là bắt buộc" })
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

const changePasswordSchema = z
  .object({
    currentPassword: z
      .string({ required_error: "Mật khẩu hiện tại là bắt buộc" })
      .min(6, "Mật khẩu hiện tại phải có ít nhất 6 ký tự"),
    newPassword: z
      .string({ required_error: "Mật khẩu mới là bắt buộc" })
      .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
    confirmPassword: z
      .string({ required_error: "Xác nhận mật khẩu là bắt buộc" })
      .min(6, "Xác nhận mật khẩu phải có ít nhất 6 ký tự"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "Mật khẩu mới phải khác mật khẩu hiện tại",
    path: ["newPassword"],
  });
module.exports = { loginSchema, registerSchema, changePasswordSchema };

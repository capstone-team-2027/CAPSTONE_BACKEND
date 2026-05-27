const { z } = require("zod");

const changePasswordSchema = z
  .object({
    currentPassword: z
      .string({ required_error: "Mật khẩu hiện tại là bắt buộc" })
      .min(6, "Mật khẩu hiện tại phải có ít nhất 6 ký tự"),
    newPassword: z
      .string({ required_error: "Mật khẩu mới là bắt buộc" })
      .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),  
    confirmNewPassword: z
      .string({ required_error: "Xác nhận mật khẩu mới là bắt buộc" })
      .min(6, "Xác nhận mật khẩu mới phải có ít nhất 6 ký tự"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Mật khẩu xác nhận không trùng khớp",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "Mật khẩu mới không được trùng mật khẩu hiện tại",
    path: ["newPassword"],
  });

module.exports = { changePasswordSchema };

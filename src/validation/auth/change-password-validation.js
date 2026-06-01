const { z } = require("zod");

// helper to trim strings before validation
const trimString = (v) => (typeof v === "string" ? v.trim() : v);

const changePasswordSchema = z
  .object({
    currentPassword: z.string({
      required_error: "Mật khẩu hiện tại là bắt buộc",
    }),
    newPassword: z
      .string({ required_error: "Mật khẩu mới là bắt buộc" })
      .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
    confirmNewPassword: z
      .string({ required_error: "Xác nhận mật khẩu mới là bắt buộc" })
      .min(6, "Xác nhận mật khẩu mới phải có ít nhất 6 ký tự"),
  })
  .superRefine((data, ctx) => {
    // If basic field validations failed (handled by zod), skip logical checks to avoid stacked errors
    if (
      !data.currentPassword ||
      data.currentPassword.length < 6 ||
      !data.newPassword ||
      data.newPassword.length < 6 ||
      !data.confirmNewPassword ||
      data.confirmNewPassword.length < 6
    ) {
      return;
    }

    // new password must differ from current
    if (data.newPassword === data.currentPassword) {
      ctx.addIssue({
        path: ["newPassword"],
        code: z.ZodIssueCode.custom,
        message: "Mật khẩu mới không được trùng mật khẩu hiện tại",
      });
      return; // stop further checks to avoid duplicate messages
    }

    // confirm must match new
    if (data.newPassword !== data.confirmNewPassword) {
      ctx.addIssue({
        path: ["confirmNewPassword"],
        code: z.ZodIssueCode.custom,
        message: "Mật khẩu xác nhận không trùng khớp",
      });
    }
  });

module.exports = { changePasswordSchema };

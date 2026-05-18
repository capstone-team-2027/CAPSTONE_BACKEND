const { z } = require("zod");

const updateProfileSchema = z.object({
    fullName: z
        .string({ required_error: "Họ Tên phải là chuỗi" })
        .min(2, "Họ tên phải có ít nhất 2 ký tự")
        .max(150, "Họ tên quá dài")
        .optional(),
});

module.exports = { updateProfileSchema };

const { z } = require("zod");

const getConfigurationByKeySchema = z.object({
  key: z
    .string({ required_error: "Key cấu hình là bắt buộc" })
    .min(1, "Key cấu hình không được để trống")
    .max(100, "Key cấu hình tối đa 100 ký tự")
});

module.exports = { getConfigurationByKeySchema };

const { z } = require("zod");

const getServiceCatalogByIdSchema = z.object({
  id: z
    .string({ required_error: "ID dịch vụ không hợp lệ" })
    .trim()
    .regex(/^[1-9]\d*$/, "ID dịch vụ không hợp lệ"),
});

const normalizePositiveInteger = (value, defaultValue, maxValue) => {
  const parsedValue = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    return defaultValue;
  }

  if (typeof maxValue === "number" && parsedValue > maxValue) {
    return maxValue;
  }

  return parsedValue;
};

const searchServiceCatalogSchema = z.object({
  q: z
    .string()
    .max(200, "Từ khóa tìm kiếm không được vượt quá 200 ký tự")
    .optional()
    .or(z.literal(""))
    .transform((value) => (typeof value === "string" ? value.trim() : "")),
  category_id: z
    .string()
    .trim()
    .optional()
    .transform((value) => {
      if (value === undefined || value === "") {
        return undefined;
      }

      return value;
    })
    .refine((value) => value === undefined || /^[1-9]\d*$/.test(value), {
      message: "Danh mục dịch vụ không hợp lệ",
    })
    .transform((value) => (value === undefined ? undefined : Number(value))),
  page: z
    .string()
    .optional()
    .transform((value) => normalizePositiveInteger(value, 1)),
  limit: z
    .string()
    .optional()
    .transform((value) => normalizePositiveInteger(value, 8, 100)),
});

module.exports = {
  getServiceCatalogByIdSchema,
  searchServiceCatalogSchema,
};

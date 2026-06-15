const { z } = require("zod");

const createPartCategorySchema = z.object({
  category_name: z
    .string({ error: "Tên danh mục phải là chuỗi" })
    .min(2, "Tên danh mục phải có ít nhất 2 ký tự"),
  description: z
    .string({ invalid_type_error: "Mô tả danh mục phải là chuỗi" })
    .min(2, "Tên danh mục phải có ít nhất 2 ký tự"),
  is_active: z
    .boolean({ error: "Trạng thái phải là true/false" })
    .optional(),
});

const updatePartCategorySchema = z.object({
  category_name: z
    .string({ invalid_type_error: "Tên danh mục phải là chuỗi" })
    .min(2, "Tên danh mục phải có ít nhất 2 ký tự")
    .optional(),
  description: z
    .string({ invalid_type_error: "Mô tả danh mục phải là chuỗi" })
    .min(2, "Tên danh mục phải có ít nhất 2 ký tự"),
  is_active: z
    .boolean({ invalid_type_error: "Trạng thái phải là true/false" })
    .optional(),
});


module.exports = {createPartCategorySchema, updatePartCategorySchema};
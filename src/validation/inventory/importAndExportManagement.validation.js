const { z } = require("zod");

const importSparePartSchema = z
  .object({
    supplier_id: z
      .number({
        required_error: "Nhà cung cấp là bắt buộc",
        invalid_type_error: "Nhà cung cấp phải là số",
      })
      .int("Nhà cung cấp không hợp lệ"),

    quantity: z
      .number({
        required_error: "Số lượng là bắt buộc",
        invalid_type_error: "Số lượng phải là số",
      })
      .int("Số lượng phải là số nguyên")
      .min(1, "Số lượng phải lớn hơn 0"),

    unit_price: z
      .number({
        required_error: "Giá nhập là bắt buộc",
        invalid_type_error: "Giá nhập phải là số",
      })
      .min(0, "Giá nhập không được âm"),

    retail_price: z
      .number({ invalid_type_error: "Giá bán phải là số" })
      .min(0, "Giá bán không được âm")
      .optional(),

    manager_id: z
      .number({
        required_error: "Người nhập là bắt buộc",
        invalid_type_error: "Người nhập phải là số",
      })
      .int("Người nhập không hợp lệ"),

    part_id: z
      .number({ invalid_type_error: "Id sản phẩm phải là số" })
      .int("Sản phẩm không hợp lệ")
      .positive("Sản phẩm không hợp lệ")
      .optional(),

    name: z
      .string({ invalid_type_error: "Tên phụ tùng phải là chuỗi" })
      .min(2, "Tên có ít nhất 2 ký tự")
      .optional(),

    brand: z
      .string({ invalid_type_error: "Thương hiệu phải là chuỗi" })
      .optional(),

    category_id: z
      .number({ invalid_type_error: "Danh mục phải là số" })
      .int("Danh mục không hợp lệ")
      .optional(),

    warranty_period_months: z
      .number({ invalid_type_error: "Thời hạn bảo hành phải là số" })
      .int("Thời hạn bảo hành phải là số nguyên")
      .min(0, "Thời hạn bảo hành không được âm")
      .optional(),

    warranty_km_limit: z
      .number({ invalid_type_error: "Số km bảo hành phải là số" })
      .int("Số km bảo hành phải là số nguyên")
      .min(0, "Số km bảo hành không được âm")
      .optional(),
  })
  .superRefine((data, ctx) => {
      console.log("part_id trong refine:", data.part_id, typeof data.part_id);
  console.log("data nhận được:", data);
    if (!data.part_id) {
      if (!data.name) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["name"],
          message: "Tên phụ tùng là bắt buộc khi tạo mới",
        });
      }
      if (data.category_id == null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["category_id"],
          message: "Danh mục là bắt buộc khi tạo mới",
        });
      }
    }
  });

module.exports = { importSparePartSchema };
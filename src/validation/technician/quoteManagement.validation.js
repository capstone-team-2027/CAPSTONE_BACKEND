const { z } = require("zod");

const quotationDetailSchema = z
  .object({
    service_catalog_id: z
      .number({ error: "Dịch vụ phải là số" })
      .int("Dịch vụ không hợp lệ")
      .positive("Dịch vụ không hợp lệ")
      .optional(),

    spare_part_id: z
      .number({ error: "Phụ tùng phải là số" })
      .int("Phụ tùng không hợp lệ")
      .positive("Phụ tùng không hợp lệ")
      .optional(),

    quantity: z
      .number({
        error: (issue) =>
          issue.input == null ? "Số lượng là bắt buộc" : "Số lượng phải là số",
      })
      .int("Số lượng phải là số nguyên")
      .min(1, "Số lượng phải lớn hơn 0"),

    unit_price: z
      .number({
        error: (issue) =>
          issue.input == null ? "Đơn giá là bắt buộc" : "Đơn giá phải là số",
      })
      .min(0, "Đơn giá không được âm"),
  })
  .superRefine((data, ctx) => {
    if (!data.service_catalog_id && !data.spare_part_id) {
      ctx.addIssue({
        code: "custom",
        path: ["service_catalog_id"],
        message: "Phải có dịch vụ hoặc phụ tùng",
      });
    }
  });

const createQuotationSchema = z.object({
  service_order_id: z
    .number({ error: "Lệnh sửa chữa phải là số" })
    .int("Lệnh sửa chữa không hợp lệ")
    .optional()
    .default(1),

  items: z
    .array(quotationDetailSchema)
    .min(1, "Báo giá phải có ít nhất một dòng"),

  note: z.string({ error: "Ghi chú phải là chuỗi" }).optional(),
});

const updateQuotationSchema = z.object({
  items: z
    .array(quotationDetailSchema)
    .min(1, "Báo giá phải có ít nhất một dòng"),

  note: z.string({ error: "Ghi chú phải là chuỗi" }).optional(),
});

module.exports = { createQuotationSchema, updateQuotationSchema };

const { z } = require("zod");

const quotationDetailSchema = z
  .object({
    issue_id: z
      .number({ error: "Lỗi phải là số" })
      .int("Lỗi không hợp lệ")
      .positive("Lỗi không hợp lệ"), 
    spare_part_id: z
      .number({ error: "Phụ tùng phải là số" })
      .int("Phụ tùng không hợp lệ")
      .positive("Phụ tùng không hợp lệ")
      .optional(),

    repair_price: z
      .number({ error: "Giá sửa chữa phải là số" })
      .min(0, "Giá sửa chữa không được âm")
      .optional(),

    quantity: z
      .number({
        error: (issue) =>
          issue.input == null ? "Số lượng là bắt buộc" : "Số lượng phải là số",
      })
      .int("Số lượng phải là số nguyên")
      .min(1, "Số lượng phải lớn hơn 0"),
  })
  .superRefine((data, ctx) => {
    if (!data.spare_part_id && (data.repair_price == null || data.repair_price === 0)) {
      ctx.addIssue({
        code: "custom",
        path: ["repair_price"],
        message: "Phải có phụ tùng hoặc giá sửa chữa",
      });
    }
  });

const createQuotationSchema = z.object({
  task_id: z
    .number({ error: "Công việc phải là số" })
    .int("Công việc không hợp lệ")
    .positive("Công việc không hợp lệ")
    .optional(),

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

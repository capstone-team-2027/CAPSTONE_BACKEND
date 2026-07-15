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
    service_id: z
      .number({ error: "Dịch vụ phải là số" })
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
    if (!data.spare_part_id && !data.service_id) {
      ctx.addIssue({
        code: "custom",
        path: ["service_id"],
        message: "Mỗi dòng phải có phụ tùng hoặc dịch vụ",
      });
    }
    if (data.spare_part_id && data.service_id) {
      ctx.addIssue({
        code: "custom",
        path: ["service_id"],
        message:
          "Một dòng chỉ được là phụ tùng hoặc dịch vụ, không được cả hai",
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

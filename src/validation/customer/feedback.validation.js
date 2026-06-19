const { z } = require("zod");

const submitFeedbackSchema = z.object({
  service_order_id: z
    .number({ required_error: "ID đơn hàng dịch vụ là bắt buộc", invalid_type_error: "ID đơn hàng dịch vụ phải là số" })
    .int("ID đơn hàng dịch vụ phải là số nguyên")
    .positive("ID đơn hàng dịch vụ phải lớn hơn 0"),
  rating: z
    .number({ required_error: "Đánh giá là bắt buộc", invalid_type_error: "Đánh giá phải là số" })
    .int("Đánh giá phải là số nguyên")
    .min(1, "Đánh giá phải từ 1 sao")
    .max(5, "Đánh giá tối đa 5 sao"),
  comment: z
    .string({ required_error: "Bình luận là bắt buộc" })
    .min(5, "Bình luận phải có ít nhất 5 ký tự")
    .max(1000, "Bình luận tối đa 1000 ký tự"),
});

module.exports = { submitFeedbackSchema };

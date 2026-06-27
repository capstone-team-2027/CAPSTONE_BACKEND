const { z } = require("zod");

const createSupplierSchema = z.object({
  name: z
    .string({ error: "Tên nhà cung cấp phải là chuỗi" })
    .min(2, "Tên nhà cung cấp phải có ít nhất 2 ký tự"),
  phone: z
    .string({ required_error: "Số điện thoại là bắt buộc" })
    .min(10, "Số điện thoại phải có ít nhất 10 số")
    .max(15, "Số điện thoại quá dài")
    .regex(/^[0-9]+$/, "Số điện thoại chỉ được chứa ký tự số"),
  address: z
    .string({ error: "Địa chỉ phải là chuỗi" })
    .min(10, "Địa chỉ phải có ít nhất 10 ký tự"),
  is_active: z
    .boolean({ error: "Trạng thái phải là true/false" }).optional(),
});
const updateSupplierSchema = z.object({
  name: z
    .string({ error: "Tên nhà cung cấp phải là chuỗi" })
    .min(2, "Tên nhà cung cấp phải có ít nhất 2 ký tự"),
  phone: z
    .string({ required_error: "Số điện thoại là bắt buộc" })
    .min(10, "Số điện thoại phải có ít nhất 10 số")
    .max(15, "Số điện thoại quá dài")
    .regex(/^[0-9]+$/, "Số điện thoại chỉ được chứa ký tự số"),
  address: z
    .string({ error: "Địa chỉ phải là chuỗi" })
    .min(10, "Địa chỉ phải có ít nhất 10 ký tự"),
  is_active: z
    .boolean({ error: "Trạng thái phải là true/false" }).optional(),
});

module.exports = { createSupplierSchema, updateSupplierSchema };

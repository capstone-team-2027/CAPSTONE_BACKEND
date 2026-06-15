const { z } = require("zod");


const createServiceCatalogSchema = z.object({
  service_name: z
    .string({ required_error: "Tên dịch vụ là bắt buộc" }),
});
const updateServiceCatalogSchema = z.object({
  service_name: z
    .string({ required_error: "Tên dịch vụ là bắt buộc" }),
});
module.exports = { createServiceCatalogSchema, updateServiceCatalogSchema };
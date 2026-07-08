const { z } = require("zod");


const createServiceCatalogSchema = z.object({
  service_name: z
    .string({ required_error: "Tên dịch vụ là bắt buộc" }),
});
const updateServiceCatalogSchema = z.object({
  service_name: z
    .string({ required_error: "Tên dịch vụ là bắt buộc" }),
});
const viewServiceCatalogSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
  q: z.string().optional(),
  all: z.string().optional().transform(val => val === "true"),
});
module.exports = { createServiceCatalogSchema, updateServiceCatalogSchema, viewServiceCatalogSchema };
const { z } = require("zod");

const toPositiveInt = z.preprocess((v) => {
  if (v === undefined || v === null || v === "") return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : v;
}, z.number().int().positive());

const toPageInt = z.preprocess((v) => {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : v;
}, z.number().int().min(1).default(1));

const toLimitInt = z.preprocess((v) => {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : v;
}, z.number().int().min(1).max(100).default(20));

const boolQuery = z.enum(["true", "false"]).transform((v) => v === "true");

const viewCombosQuerySchema = z.object({
  page: toPageInt.optional(),
  limit: toLimitInt.optional(),
  q: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length ? v : undefined)),
  is_active: boolQuery.optional(),
  include_services: boolQuery.optional().default(true),
});

const createComboSchema = z.object({
  category_name: z
    .string({ required_error: "category_name is required" })
    .trim()
    .min(1, "category_name cannot be empty")
    .max(100, "category_name max length is 100"),
  is_active: z.boolean().optional().default(true),
  service_ids: z
    .array(toPositiveInt)
    .optional()
    .default([])
    .transform((arr) => [...new Set(arr)]),
});

const updateComboSchema = z
  .object({
    category_name: z.string().trim().min(1).max(100).optional(),
    is_active: z.boolean().optional(),
    service_ids: z
      .array(toPositiveInt)
      .optional()
      .transform((arr) => [...new Set(arr)]),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "body must have at least one field to update",
  });

module.exports = {
  viewCombosQuerySchema,
  createComboSchema,
  updateComboSchema,
};

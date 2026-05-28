const { z } = require("zod");


const toPositiveInt = z.preprocess((v) => {
  if (v === undefined || v === null || v === "") return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : v;
}, z.number({ invalid_type_error: "Must be a positive integer" }).int().positive());

const toPageInt = z.preprocess((v) => {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : v;
}, z.number().int().min(1).optional().default(1));

const toLimitInt = z.preprocess((v) => {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : v;
}, z.number().int().min(1).max(100).optional().default(20));

const boolQuery = z
  .enum(["true", "false"], {
    invalid_type_error: "Must be 'true' or 'false'",
  })
  .transform((v) => v === "true");

// ── Schemas ────────────────────────────────────────────────────────────────

const viewCategorySchema = z.object({
  page: toPageInt,
  limit: toLimitInt,
  q: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v?.length ? v : undefined)),
  is_active: boolQuery.optional(),
  include_services: boolQuery.optional().default("true"), // default dạng string vì từ query string
});

const createCategorySchema = z.object({
  category_name: z
    .string({ required_error: "category_name is required" })
    .trim()
    .min(1, "category_name cannot be empty")
    .max(100, "category_name max length is 100"),

  is_active: z.boolean().optional().default(true),
});

const updateCategorySchema = z
  .object({
    category_name: z
      .string()
      .trim()
      .min(1, "category_name cannot be empty")
      .max(100, "category_name max length is 100")
      .optional(),

    is_active: z.boolean().optional(),

    // FIX: guard undefined trước khi spread vào Set
    service_ids: z
      .array(toPositiveInt)
      .optional()
      .transform((arr) => (arr ? [...new Set(arr)] : undefined)),
  })
  // FIX: dùng superRefine để check trước khi transform làm mất key
  .superRefine((obj, ctx) => {
    const defined = Object.values(obj).some((v) => v !== undefined);
    if (!defined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Body must have at least one field to update",
      });
    }
  });

module.exports = {
  viewCategorySchema,
  createCategorySchema,
  updateCategorySchema,
};
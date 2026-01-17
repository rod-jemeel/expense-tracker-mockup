import { z } from "zod"
import { uuidSchema, amountSchema, paginationSchema } from "./common"

/**
 * Frequency schema - currently only monthly supported
 */
const frequencySchema = z.enum(["monthly"])

/**
 * Day of month schema (1-31)
 */
const dayOfMonthSchema = z.coerce
  .number()
  .int()
  .min(1, "Day must be between 1 and 31")
  .max(31, "Day must be between 1 and 31")

/**
 * Create recurring template request body
 */
export const createRecurringTemplateSchema = z.object({
  categoryId: uuidSchema,
  vendor: z.string().max(255).optional(),
  estimatedAmount: amountSchema.optional(),
  notes: z.string().max(1000).optional(),
  frequency: frequencySchema.default("monthly"),
  typicalDayOfMonth: dayOfMonthSchema.optional(),
})

export type CreateRecurringTemplateInput = z.infer<typeof createRecurringTemplateSchema>

/**
 * Update recurring template request body
 */
export const updateRecurringTemplateSchema = z.object({
  categoryId: uuidSchema.optional(),
  vendor: z.string().max(255).nullable().optional(),
  estimatedAmount: amountSchema.nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
  frequency: frequencySchema.optional(),
  typicalDayOfMonth: dayOfMonthSchema.nullable().optional(),
  isActive: z.boolean().optional(),
})

export type UpdateRecurringTemplateInput = z.infer<typeof updateRecurringTemplateSchema>

/**
 * List recurring templates query parameters
 */
export const listRecurringTemplatesSchema = paginationSchema.extend({
  categoryId: uuidSchema.optional(),
  isActive: z.coerce.boolean().optional(),
})

export type ListRecurringTemplatesQuery = z.infer<typeof listRecurringTemplatesSchema>

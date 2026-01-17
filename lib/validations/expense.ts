import { z } from "zod"
import {
  uuidSchema,
  dateSchema,
  amountSchema,
  paginationSchema,
  dateRangeSchema,
} from "./common"

/**
 * Create expense request body
 */
export const createExpenseSchema = z.object({
  expenseDate: dateSchema,
  categoryId: uuidSchema,
  amount: amountSchema,
  vendor: z.string().max(255).optional(),
  notes: z.string().max(1000).optional(),
  tagIds: z.array(uuidSchema).max(10).optional(),
})

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>

/**
 * Update expense request body (all fields optional)
 */
export const updateExpenseSchema = z.object({
  expenseDate: dateSchema.optional(),
  categoryId: uuidSchema.optional(),
  amount: amountSchema.optional(),
  vendor: z.string().max(255).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
  tagIds: z.array(uuidSchema).max(10).optional(),
})

export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>

/**
 * List expenses query parameters
 */
export const listExpensesSchema = paginationSchema.merge(dateRangeSchema).extend({
  categoryId: uuidSchema.optional(),
  tagId: uuidSchema.optional(),
})

export type ListExpensesQuery = z.infer<typeof listExpensesSchema>

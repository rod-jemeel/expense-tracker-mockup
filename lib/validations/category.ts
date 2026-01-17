import { z } from "zod"

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
})

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  is_active: z.boolean().optional(),
})

export const listCategoriesSchema = z.object({
  includeInactive: z.coerce.boolean().optional().default(false),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type ListCategoriesInput = z.infer<typeof listCategoriesSchema>

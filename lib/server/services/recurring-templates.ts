import { cache } from "react"
import { supabase } from "@/lib/server/db"
import { ApiError } from "@/lib/errors"
import type {
  CreateRecurringTemplateInput,
  UpdateRecurringTemplateInput,
  ListRecurringTemplatesQuery,
} from "@/lib/validations/recurring-template"

interface RecurringTemplateRow {
  id: string
  org_id: string
  category_id: string
  vendor: string | null
  estimated_amount: number | null
  notes: string | null
  frequency: string
  typical_day_of_month: number | null
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
}

interface RecurringTemplateWithCategory extends RecurringTemplateRow {
  expense_categories: { id: string; name: string } | null
}

/**
 * Create a new recurring expense template
 */
export async function createRecurringTemplate(data: {
  input: CreateRecurringTemplateInput
  orgId: string
  userId: string
}) {
  const { input, orgId, userId } = data

  const { data: template, error } = await supabase
    .from("recurring_expense_templates")
    .insert({
      org_id: orgId,
      category_id: input.categoryId,
      vendor: input.vendor ?? null,
      estimated_amount: input.estimatedAmount ?? null,
      notes: input.notes ?? null,
      frequency: input.frequency,
      typical_day_of_month: input.typicalDayOfMonth ?? null,
      created_by: userId,
    })
    .select("*, expense_categories(id, name)")
    .single()

  if (error) {
    console.error("Failed to create recurring template:", error)
    throw new ApiError("DATABASE_ERROR", "Failed to create recurring template")
  }

  return template as RecurringTemplateWithCategory
}

/**
 * List recurring templates with filtering and pagination
 * Uses React.cache() for per-request deduplication
 */
export const listRecurringTemplates = cache(async function listRecurringTemplates(data: {
  query: ListRecurringTemplatesQuery
  orgId: string
}) {
  const { query, orgId } = data

  let dbQuery = supabase
    .from("recurring_expense_templates")
    .select("*, expense_categories(id, name)", { count: "exact" })
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })

  // Apply filters
  if (query.categoryId) {
    dbQuery = dbQuery.eq("category_id", query.categoryId)
  }
  if (query.isActive !== undefined) {
    dbQuery = dbQuery.eq("is_active", query.isActive)
  }

  // Pagination
  if (query.cursor) {
    dbQuery = dbQuery.lt("created_at", query.cursor)
  } else if (query.page && query.page > 1) {
    const offset = (query.page - 1) * query.limit
    dbQuery = dbQuery.range(offset, offset + query.limit - 1)
  }

  if (!query.page) {
    dbQuery = dbQuery.limit(query.limit)
  }

  const { data: templates, error, count } = await dbQuery

  if (error) {
    console.error("Failed to list recurring templates:", error)
    throw new ApiError("DATABASE_ERROR", "Failed to list recurring templates")
  }

  // Determine next cursor
  const nextCursor =
    templates.length === query.limit
      ? templates[templates.length - 1]?.created_at
      : undefined

  return {
    items: templates as RecurringTemplateWithCategory[],
    nextCursor,
    total: count ?? 0,
  }
})

/**
 * Get a single recurring template by ID
 */
export async function getRecurringTemplate(data: {
  templateId: string
  orgId: string
}) {
  const { templateId, orgId } = data

  const { data: template, error } = await supabase
    .from("recurring_expense_templates")
    .select("*, expense_categories(id, name)")
    .eq("id", templateId)
    .eq("org_id", orgId)
    .single()

  if (error || !template) {
    throw new ApiError("NOT_FOUND", "Recurring template not found")
  }

  return template as RecurringTemplateWithCategory
}

/**
 * Update a recurring template
 */
export async function updateRecurringTemplate(data: {
  templateId: string
  orgId: string
  input: UpdateRecurringTemplateInput
}) {
  const { templateId, orgId, input } = data

  // Build update object with only provided fields
  const updateData: Record<string, unknown> = {}
  if (input.categoryId !== undefined) updateData.category_id = input.categoryId
  if (input.vendor !== undefined) updateData.vendor = input.vendor
  if (input.estimatedAmount !== undefined) updateData.estimated_amount = input.estimatedAmount
  if (input.notes !== undefined) updateData.notes = input.notes
  if (input.frequency !== undefined) updateData.frequency = input.frequency
  if (input.typicalDayOfMonth !== undefined) updateData.typical_day_of_month = input.typicalDayOfMonth
  if (input.isActive !== undefined) updateData.is_active = input.isActive

  if (Object.keys(updateData).length === 0) {
    throw new ApiError("VALIDATION_ERROR", "No fields to update")
  }

  const { error } = await supabase
    .from("recurring_expense_templates")
    .update(updateData)
    .eq("id", templateId)
    .eq("org_id", orgId)

  if (error) {
    console.error("Failed to update recurring template:", error)
    throw new ApiError("DATABASE_ERROR", "Failed to update recurring template")
  }

  // Return updated template
  return getRecurringTemplate({ templateId, orgId })
}

/**
 * Delete (deactivate) a recurring template
 * We soft-delete by setting is_active = false to preserve history
 */
export async function deleteRecurringTemplate(data: {
  templateId: string
  orgId: string
}) {
  const { templateId, orgId } = data

  const { error } = await supabase
    .from("recurring_expense_templates")
    .update({ is_active: false })
    .eq("id", templateId)
    .eq("org_id", orgId)

  if (error) {
    console.error("Failed to delete recurring template:", error)
    throw new ApiError("DATABASE_ERROR", "Failed to delete recurring template")
  }

  return { deleted: true }
}

/**
 * Get expense history for a recurring template
 * Returns expenses that were created from this template
 */
export async function getTemplateExpenseHistory(data: {
  templateId: string
  orgId: string
  limit?: number
}) {
  const { templateId, orgId, limit = 12 } = data

  const { data: expenses, error } = await supabase
    .from("expenses")
    .select("id, expense_date, amount, created_at")
    .eq("recurring_template_id", templateId)
    .eq("org_id", orgId)
    .order("expense_date", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Failed to get template expense history:", error)
    return []
  }

  return expenses
}

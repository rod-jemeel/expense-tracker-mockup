import { cache } from "react"
import { supabase } from "@/lib/server/db"
import type {
  CreateEmailCategoryInput,
  UpdateEmailCategoryInput,
  ListEmailCategoriesInput,
} from "@/lib/validations/email"

export interface EmailCategory {
  id: string
  org_id: string
  name: string
  description: string | null
  color: string
  keywords: string[] | null
  sender_patterns: string[] | null
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
}

/**
 * List email categories for an organization
 * Uses React.cache() for per-request deduplication
 */
export const listEmailCategories = cache(async function listEmailCategories({
  orgId,
  query,
}: {
  orgId: string
  query: ListEmailCategoriesInput
}): Promise<{ items: EmailCategory[]; total: number }> {
  let queryBuilder = supabase
    .from("email_categories")
    .select("*", { count: "exact" })
    .eq("org_id", orgId)
    .order("name", { ascending: true })

  if (!query.includeInactive) {
    queryBuilder = queryBuilder.eq("is_active", true)
  }

  const { data, count, error } = await queryBuilder

  if (error) throw error

  return {
    items: data || [],
    total: count || 0,
  }
})

export async function getEmailCategory({
  categoryId,
  orgId,
}: {
  categoryId: string
  orgId: string
}): Promise<EmailCategory> {
  const { data, error } = await supabase
    .from("email_categories")
    .select("*")
    .eq("id", categoryId)
    .eq("org_id", orgId)
    .single()

  if (error) throw error
  return data
}

export async function createEmailCategory({
  orgId,
  userId,
  data,
}: {
  orgId: string
  userId: string
  data: CreateEmailCategoryInput
}): Promise<EmailCategory> {
  const { data: category, error } = await supabase
    .from("email_categories")
    .insert({
      org_id: orgId,
      name: data.name,
      description: data.description || null,
      color: data.color,
      keywords: data.keywords || null,
      sender_patterns: data.senderPatterns || null,
      is_active: true,
      created_by: userId,
    })
    .select()
    .single()

  if (error) throw error
  return category
}

export async function updateEmailCategory({
  categoryId,
  orgId,
  data,
}: {
  categoryId: string
  orgId: string
  data: UpdateEmailCategoryInput
}): Promise<EmailCategory> {
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (data.name !== undefined) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description
  if (data.color !== undefined) updateData.color = data.color
  if (data.keywords !== undefined) updateData.keywords = data.keywords
  if (data.senderPatterns !== undefined) updateData.sender_patterns = data.senderPatterns
  if (data.isActive !== undefined) updateData.is_active = data.isActive

  const { data: category, error } = await supabase
    .from("email_categories")
    .update(updateData)
    .eq("id", categoryId)
    .eq("org_id", orgId)
    .select()
    .single()

  if (error) throw error
  return category
}

export async function deleteEmailCategory({
  categoryId,
  orgId,
}: {
  categoryId: string
  orgId: string
}): Promise<void> {
  const { error } = await supabase
    .from("email_categories")
    .delete()
    .eq("id", categoryId)
    .eq("org_id", orgId)

  if (error) throw error
}

// =============================================================================
// Cross-org queries (superadmin only)
// =============================================================================

export interface EmailCategoryWithOrg extends EmailCategory {
  organization?: {
    id: string
    name: string
  } | null
}

/**
 * List email categories across ALL organizations (superadmin only)
 */
export const listAllEmailCategories = cache(async function listAllEmailCategories(data: {
  query: ListEmailCategoriesInput & {
    orgId?: string
    page?: number
    limit?: number
    search?: string
    sortBy?: string
    sortOrder?: "asc" | "desc"
    isActive?: boolean
  }
}) {
  const { query } = data
  const page = query.page ?? 1
  const limit = query.limit ?? 20
  const sortBy = query.sortBy ?? "name"
  const sortOrder = query.sortOrder ?? "asc"

  let dbQuery = supabase
    .from("email_categories")
    .select("*, organization(id, name)", { count: "exact" })
    .order(sortBy, { ascending: sortOrder === "asc" })

  // Optional org filter
  if (query.orgId) {
    dbQuery = dbQuery.eq("org_id", query.orgId)
  }

  // Active filter (explicit true/false, or includeInactive for legacy)
  if (query.isActive !== undefined) {
    dbQuery = dbQuery.eq("is_active", query.isActive)
  } else if (!query.includeInactive) {
    dbQuery = dbQuery.eq("is_active", true)
  }

  // Search filter
  if (query.search) {
    dbQuery = dbQuery.ilike("name", `%${query.search}%`)
  }

  // Pagination
  if (page >= 1) {
    const offset = (page - 1) * limit
    dbQuery = dbQuery.range(offset, offset + limit - 1)
  }

  const { data: categories, count, error } = await dbQuery

  if (error) throw error

  return {
    items: categories as EmailCategoryWithOrg[],
    total: count ?? 0,
    page,
    limit,
  }
})

/**
 * Get cross-org email category stats
 */
export const getAllCategoryStats = cache(async function getAllCategoryStats() {
  const { data: categories, error } = await supabase
    .from("email_categories")
    .select("org_id, is_active, organization(id, name)")

  if (error) throw error

  const orgStats = new Map<string, { name: string; active: number; total: number }>()
  let totalCount = 0
  let activeCount = 0

  for (const category of categories || []) {
    totalCount++
    if (category.is_active) activeCount++

    const org = category.organization
    const orgName = org && typeof org === "object" && "name" in org
      ? (org as { name: string }).name
      : "Unknown"

    const existing = orgStats.get(category.org_id) || { name: orgName, active: 0, total: 0 }
    existing.total++
    if (category.is_active) existing.active++
    orgStats.set(category.org_id, existing)
  }

  return {
    totalCount,
    activeCount,
    byOrg: Array.from(orgStats.entries()).map(([orgId, stats]) => ({
      orgId,
      orgName: stats.name,
      active: stats.active,
      total: stats.total,
    })),
  }
})

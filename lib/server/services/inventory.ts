import { cache } from "react"
import { supabase } from "@/lib/server/db"
import { ApiError } from "@/lib/errors"
import { logCreate, logUpdate, logDelete } from "./audit"
import type {
  CreateItemInput,
  UpdateItemInput,
  ListItemsQuery,
} from "@/lib/validations/inventory"

interface ItemRow {
  id: string
  org_id: string
  sku: string | null
  name: string
  unit: string
  is_active: boolean
  created_at: string
}

/**
 * Create a new inventory item
 */
export async function createItem(data: {
  input: CreateItemInput
  orgId: string
  userId: string
}) {
  const { input, orgId, userId } = data

  const { data: item, error } = await supabase
    .from("inventory_items")
    .insert({
      org_id: orgId,
      name: input.name,
      sku: input.sku ?? null,
      unit: input.unit,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    console.error("Failed to create inventory item:", error)
    if (error.code === "23505") {
      throw new ApiError("ALREADY_EXISTS", "Item with this SKU already exists")
    }
    throw new ApiError("DATABASE_ERROR", "Failed to create inventory item")
  }

  // Audit log (non-blocking)
  logCreate(orgId, userId, "inventory_item", item.id, {
    name: input.name,
    sku: input.sku,
    unit: input.unit,
  })

  return item as ItemRow
}

/**
 * List inventory items with filtering and pagination
 * Uses React.cache() for per-request deduplication
 */
export const listItems = cache(async function listItems(data: {
  query: ListItemsQuery
  orgId: string
}) {
  const { query, orgId } = data

  let dbQuery = supabase
    .from("inventory_items")
    .select("*", { count: "exact" })
    .eq("org_id", orgId)
    .order("name", { ascending: true })

  // Filter by active status
  if (query.isActive !== undefined) {
    dbQuery = dbQuery.eq("is_active", query.isActive)
  }

  // Search by name or SKU
  // Escape PostgREST special characters to prevent filter injection
  if (query.search) {
    const escapedSearch = query.search.replace(/[%_\\]/g, "\\$&")
    dbQuery = dbQuery.or(`name.ilike.%${escapedSearch}%,sku.ilike.%${escapedSearch}%`)
  }

  // Support both cursor and offset-based pagination
  if (query.cursor) {
    dbQuery = dbQuery.gt("name", query.cursor)
  } else if (query.page && query.page > 1) {
    const offset = (query.page - 1) * query.limit
    dbQuery = dbQuery.range(offset, offset + query.limit - 1)
  }

  if (!query.page) {
    dbQuery = dbQuery.limit(query.limit)
  }

  const { data: items, error, count } = await dbQuery

  if (error) {
    console.error("Failed to list inventory items:", error)
    throw new ApiError("DATABASE_ERROR", "Failed to list inventory items")
  }

  const nextCursor =
    items.length === query.limit ? items[items.length - 1]?.name : undefined

  return {
    items: items as ItemRow[],
    nextCursor,
    total: count ?? 0,
  }
})

/**
 * Get a single inventory item by ID
 */
export async function getItem(data: { itemId: string; orgId: string }) {
  const { itemId, orgId } = data

  const { data: item, error } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("id", itemId)
    .eq("org_id", orgId)
    .single()

  if (error || !item) {
    throw new ApiError("ITEM_NOT_FOUND")
  }

  return item as ItemRow
}

/**
 * Update an inventory item
 */
export async function updateItem(data: {
  itemId: string
  orgId: string
  userId: string
  input: UpdateItemInput
}) {
  const { itemId, orgId, userId, input } = data

  // Get current item for audit log
  const { data: oldItem } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("id", itemId)
    .eq("org_id", orgId)
    .single()

  // Build update object
  const updateData: Record<string, unknown> = {}
  if (input.name !== undefined) updateData.name = input.name
  if (input.sku !== undefined) updateData.sku = input.sku
  if (input.unit !== undefined) updateData.unit = input.unit
  if (input.isActive !== undefined) updateData.is_active = input.isActive

  if (Object.keys(updateData).length === 0) {
    throw new ApiError("VALIDATION_ERROR", "No fields to update")
  }

  const { data: item, error } = await supabase
    .from("inventory_items")
    .update(updateData)
    .eq("id", itemId)
    .eq("org_id", orgId)
    .select()
    .single()

  if (error) {
    console.error("Failed to update inventory item:", error)
    if (error.code === "23505") {
      throw new ApiError("ALREADY_EXISTS", "Item with this SKU already exists")
    }
    throw new ApiError("DATABASE_ERROR", "Failed to update inventory item")
  }

  if (!item) {
    throw new ApiError("ITEM_NOT_FOUND")
  }

  // Audit log (non-blocking)
  if (oldItem) {
    logUpdate(orgId, userId, "inventory_item", itemId, oldItem, item)
  }

  return item as ItemRow
}

/**
 * Delete (soft delete by deactivating) an inventory item
 */
export async function deleteItem(data: {
  itemId: string
  orgId: string
  userId: string
}) {
  const { itemId, orgId, userId } = data

  // Get item for audit log
  const { data: item } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("id", itemId)
    .eq("org_id", orgId)
    .single()

  const { error } = await supabase
    .from("inventory_items")
    .update({ is_active: false })
    .eq("id", itemId)
    .eq("org_id", orgId)

  if (error) {
    console.error("Failed to deactivate inventory item:", error)
    throw new ApiError("DATABASE_ERROR", "Failed to delete inventory item")
  }

  // Audit log (non-blocking) - log as delete even though it's a soft delete
  if (item) {
    logDelete(orgId, userId, "inventory_item", itemId, item)
  }

  return { deleted: true }
}

// =============================================================================
// Cross-org queries (superadmin only)
// =============================================================================

export interface ItemWithOrg extends ItemRow {
  organization?: {
    id: string
    name: string
  } | null
}

/**
 * List inventory items across ALL organizations (superadmin only)
 * Uses FK relationship to organization table for efficient JOINs
 */
export const listAllItems = cache(async function listAllItems(data: {
  query: ListItemsQuery & {
    orgId?: string
    sortBy?: string
    sortOrder?: "asc" | "desc"
  }
}) {
  const { query } = data
  const sortBy = query.sortBy ?? "name"
  const sortOrder = query.sortOrder ?? "asc"

  let dbQuery = supabase
    .from("inventory_items")
    .select("*, organization(id, name)", { count: "exact" })
    .order(sortBy, { ascending: sortOrder === "asc" })

  // Optional org filter
  if (query.orgId) {
    dbQuery = dbQuery.eq("org_id", query.orgId)
  }

  // Filter by active status
  if (query.isActive !== undefined) {
    dbQuery = dbQuery.eq("is_active", query.isActive)
  }

  // Search by name or SKU
  if (query.search) {
    const escapedSearch = query.search.replace(/[%_\\]/g, "\\$&")
    dbQuery = dbQuery.or(`name.ilike.%${escapedSearch}%,sku.ilike.%${escapedSearch}%`)
  }

  // Pagination
  if (query.page && query.page >= 1) {
    const offset = (query.page - 1) * query.limit
    dbQuery = dbQuery.range(offset, offset + query.limit - 1)
  } else {
    dbQuery = dbQuery.limit(query.limit)
  }

  const { data: items, error, count } = await dbQuery

  if (error) {
    console.error("Failed to list all inventory items:", error)
    throw new ApiError("DATABASE_ERROR", "Failed to list inventory items")
  }

  return {
    items: (items || []) as ItemWithOrg[],
    total: count ?? 0,
    page: query.page ?? 1,
    limit: query.limit,
  }
})

/**
 * Get cross-org inventory stats
 * Uses FK relationship to organization table for efficient JOINs
 */
export const getAllInventoryStats = cache(async function getAllInventoryStats() {
  const { data: items, error } = await supabase
    .from("inventory_items")
    .select("org_id, is_active, organization(id, name)")

  if (error) {
    console.error("Failed to get inventory stats:", error)
    throw new ApiError("DATABASE_ERROR", "Failed to get inventory stats")
  }

  const orgStats = new Map<string, { name: string; active: number; total: number }>()
  let totalCount = 0
  let activeCount = 0

  for (const item of items || []) {
    totalCount++
    if (item.is_active) activeCount++

    // Handle both array and single object (Supabase types may vary)
    const orgData = item.organization as { id: string; name: string } | { id: string; name: string }[] | null
    const org = Array.isArray(orgData) ? orgData[0] : orgData
    const orgName = org?.name || "Unknown"

    const existing = orgStats.get(item.org_id) || { name: orgName, active: 0, total: 0 }
    existing.total++
    if (item.is_active) existing.active++
    orgStats.set(item.org_id, existing)
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

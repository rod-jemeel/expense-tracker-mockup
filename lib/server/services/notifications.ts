import { cache } from "react"
import { supabase } from "@/lib/server/db"

export interface Notification {
  id: string
  org_id: string
  user_id: string
  type: "email_forwarded" | "rule_triggered" | "system" | "info"
  title: string
  message: string | null
  related_type: string | null
  related_id: string | null
  metadata: Record<string, unknown>
  is_read: boolean
  read_at: string | null
  created_at: string
}

export interface CreateNotificationInput {
  orgId: string
  userId: string
  type: Notification["type"]
  title: string
  message?: string
  relatedType?: string
  relatedId?: string
  metadata?: Record<string, unknown>
}

/**
 * Get notifications for a user (with caching per request)
 */
export const getNotifications = cache(async function getNotifications({
  userId,
  orgId,
  limit = 20,
  includeRead = false,
}: {
  userId: string
  orgId: string
  limit?: number
  includeRead?: boolean
}): Promise<{ items: Notification[]; unreadCount: number }> {
  let query = supabase
    .from("notifications")
    .select("*")
    .eq("org_id", orgId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (!includeRead) {
    query = query.eq("is_read", false)
  }

  const { data, error } = await query

  if (error) throw error

  // Get unread count
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("org_id", orgId)
    .eq("user_id", userId)
    .eq("is_read", false)

  return {
    items: data || [],
    unreadCount: count || 0,
  }
})

/**
 * Get unread notification count for a user
 */
export const getUnreadCount = cache(async function getUnreadCount({
  userId,
  orgId,
}: {
  userId: string
  orgId: string
}): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("org_id", orgId)
    .eq("user_id", userId)
    .eq("is_read", false)

  if (error) throw error

  return count || 0
})

/**
 * Create a new notification
 */
export async function createNotification(
  input: CreateNotificationInput
): Promise<Notification> {
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      org_id: input.orgId,
      user_id: input.userId,
      type: input.type,
      title: input.title,
      message: input.message || null,
      related_type: input.relatedType || null,
      related_id: input.relatedId || null,
      metadata: input.metadata || {},
    })
    .select()
    .single()

  if (error) throw error

  return data
}

/**
 * Create notifications for multiple users
 */
export async function createNotificationsForUsers(
  userIds: string[],
  input: Omit<CreateNotificationInput, "userId">
): Promise<void> {
  if (userIds.length === 0) return

  const notifications = userIds.map((userId) => ({
    org_id: input.orgId,
    user_id: userId,
    type: input.type,
    title: input.title,
    message: input.message || null,
    related_type: input.relatedType || null,
    related_id: input.relatedId || null,
    metadata: input.metadata || {},
  }))

  const { error } = await supabase.from("notifications").insert(notifications)

  if (error) throw error
}

/**
 * Mark a notification as read
 */
export async function markNotificationRead({
  notificationId,
  userId,
  orgId,
}: {
  notificationId: string
  userId: string
  orgId: string
}): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq("id", notificationId)
    .eq("user_id", userId)
    .eq("org_id", orgId)

  if (error) throw error
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsRead({
  userId,
  orgId,
}: {
  userId: string
  orgId: string
}): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("org_id", orgId)
    .eq("is_read", false)

  if (error) throw error
}

/**
 * Delete old notifications (cleanup job)
 */
export async function deleteOldNotifications(daysOld: number = 30): Promise<number> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - daysOld)

  const { data, error } = await supabase
    .from("notifications")
    .delete()
    .lt("created_at", cutoff.toISOString())
    .select("id")

  if (error) throw error

  return data?.length || 0
}

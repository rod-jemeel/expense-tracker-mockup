import { create } from "zustand"

export interface Notification {
  id: string
  type: string
  title: string
  message: string | null
  related_type: string | null
  related_id: string | null
  metadata: Record<string, unknown>
  is_read: boolean
  created_at: string
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
}

interface NotificationActions {
  fetchNotifications: (orgId: string) => Promise<void>
  fetchUnreadCount: (orgId: string) => Promise<void>
  markAsRead: (orgId: string, notificationId: string) => Promise<void>
  markAllAsRead: (orgId: string) => Promise<void>
}

export const useNotificationStore = create<NotificationState & NotificationActions>()(
  (set) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,

    fetchNotifications: async (orgId) => {
      set({ isLoading: true })
      try {
        const response = await fetch(
          `/api/orgs/${orgId}/notifications?includeRead=true&limit=10`
        )
        if (response.ok) {
          const data = await response.json()
          set({ notifications: data.items, unreadCount: data.unreadCount })
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error)
      } finally {
        set({ isLoading: false })
      }
    },

    fetchUnreadCount: async (orgId) => {
      try {
        const response = await fetch(
          `/api/orgs/${orgId}/notifications?countOnly=true`
        )
        if (response.ok) {
          const data = await response.json()
          set({ unreadCount: data.unreadCount })
        }
      } catch (error) {
        console.error("Failed to fetch unread count:", error)
      }
    },

    markAsRead: async (orgId, notificationId) => {
      try {
        await fetch(`/api/orgs/${orgId}/notifications/${notificationId}`, {
          method: "PATCH",
        })
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === notificationId ? { ...n, is_read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }))
      } catch (error) {
        console.error("Failed to mark notification as read:", error)
      }
    },

    markAllAsRead: async (orgId) => {
      try {
        await fetch(`/api/orgs/${orgId}/notifications/read-all`, {
          method: "POST",
        })
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
          unreadCount: 0,
        }))
      } catch (error) {
        console.error("Failed to mark all as read:", error)
      }
    },
  })
)

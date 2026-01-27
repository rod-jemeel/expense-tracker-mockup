"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { Bell, Check, CheckCheck, Mail } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useNotificationStore } from "@/lib/stores/notification-store"

export function NotificationsBell() {
  const router = useRouter()
  const { data: activeOrg } = authClient.useActiveOrganization()
  const [open, setOpen] = useState(false)

  const notifications = useNotificationStore((s) => s.notifications)
  const unreadCount = useNotificationStore((s) => s.unreadCount)
  const isLoading = useNotificationStore((s) => s.isLoading)
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications)
  const fetchUnreadCount = useNotificationStore((s) => s.fetchUnreadCount)
  const markAsRead = useNotificationStore((s) => s.markAsRead)
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead)

  const orgId = activeOrg?.id

  // Fetch unread count on mount and periodically
  useEffect(() => {
    if (!orgId) return
    fetchUnreadCount(orgId)
    const interval = setInterval(() => fetchUnreadCount(orgId), 30000)
    return () => clearInterval(interval)
  }, [orgId, fetchUnreadCount])

  // Fetch full notifications when popover opens
  useEffect(() => {
    if (open && orgId) {
      fetchNotifications(orgId)
    }
  }, [open, orgId, fetchNotifications])

  const handleMarkAsRead = useCallback(
    (notificationId: string) => {
      if (!orgId) return
      markAsRead(orgId, notificationId)
    },
    [orgId, markAsRead]
  )

  const handleMarkAllAsRead = useCallback(() => {
    if (!orgId) return
    markAllAsRead(orgId)
  }, [orgId, markAllAsRead])

  function handleNotificationClick(notification: { id: string; is_read: boolean; related_type: string | null; related_id: string | null }) {
    if (!notification.is_read) {
      handleMarkAsRead(notification.id)
    }

    if (notification.related_type === "detected_email" && notification.related_id) {
      setOpen(false)
      router.push(`/inbox?email=${notification.related_id}`)
    }
  }

  function getNotificationIcon(type: string) {
    switch (type) {
      case "email_forwarded":
        return <Mail className="size-3.5 text-blue-500" />
      default:
        return <Bell className="size-3.5 text-muted-foreground" />
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative size-8"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 size-4 justify-center p-0 text-[10px]"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 p-0"
        sideOffset={8}
      >
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <h3 className="text-xs font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 gap-1 text-[10px]"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="size-3" />
              Mark all read
            </Button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="size-8 mb-2 opacity-50" />
              <p className="text-xs">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleNotificationClick(notification)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      handleNotificationClick(notification)
                    }
                  }}
                  className={cn(
                    "flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/50 cursor-pointer",
                    !notification.is_read && "bg-primary/5"
                  )}
                >
                  <div className="mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-xs truncate",
                      !notification.is_read && "font-medium"
                    )}>
                      {notification.title}
                    </p>
                    {notification.message && (
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                        {notification.message}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMarkAsRead(notification.id)
                      }}
                    >
                      <Check className="size-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="border-t border-border px-3 py-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-7 text-xs"
              onClick={() => {
                setOpen(false)
                router.push("/inbox")
              }}
            >
              View all in Inbox
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

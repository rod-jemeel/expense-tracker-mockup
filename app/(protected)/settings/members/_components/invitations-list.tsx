"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Clock, Mail, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Invitation {
  id: string
  email: string
  role: string
  status: string
  expiresAt: Date | string
  createdAt: Date | string
}

interface InvitationsListProps {
  invitations: Invitation[]
  orgId: string
}

const ROLE_COLORS: Record<string, string> = {
  org_admin: "bg-primary/10 text-primary",
  finance: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  inventory: "bg-green-500/10 text-green-600 dark:text-green-400",
  viewer: "bg-muted text-muted-foreground",
}

export function InvitationsList({ invitations, orgId }: InvitationsListProps) {
  const router = useRouter()
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const handleCancel = async (invitationId: string) => {
    setCancellingId(invitationId)
    try {
      const response = await fetch(
        `/api/orgs/${orgId}/invitations/${invitationId}`,
        {
          method: "DELETE",
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error?.message || "Failed to cancel invitation")
      }

      router.refresh()
    } catch (error) {
      console.error("Failed to cancel invitation:", error)
      // Could show a toast here
    } finally {
      setCancellingId(null)
    }
  }

  const formatRole = (role: string) => {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const formatDate = (dateVal: Date | string) => {
    const date = typeof dateVal === "string" ? new Date(dateVal) : dateVal
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  const isExpired = (expiresAt: Date | string) => {
    const date = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt
    return date < new Date()
  }

  if (invitations.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">
        Pending Invitations
      </h3>
      <div className="divide-y divide-border rounded-lg border border-border">
        {invitations.map((invitation) => {
          const expired = isExpired(invitation.expiresAt)

          return (
            <div
              key={invitation.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                  <Mail className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">{invitation.email}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    <span>
                      {expired
                        ? "Expired"
                        : `Expires ${formatDate(invitation.expiresAt)}`}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={
                    expired
                      ? "bg-destructive/10 text-destructive"
                      : ROLE_COLORS[invitation.role] || ROLE_COLORS.viewer
                  }
                >
                  {expired ? "Expired" : formatRole(invitation.role)}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleCancel(invitation.id)}
                  disabled={cancellingId === invitation.id}
                >
                  {cancellingId === invitation.id ? (
                    <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <X className="size-3.5" />
                  )}
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

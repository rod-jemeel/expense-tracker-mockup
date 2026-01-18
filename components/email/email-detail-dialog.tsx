"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow, format } from "date-fns"
import { Archive, Mail, MailOpen, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CategoryBadge, UncategorizedBadge } from "./category-badge"
import type { DetectedEmailWithCategory } from "@/lib/server/services/detected-emails"
import type { EmailCategory } from "@/lib/server/services/email-categories"

interface EmailDetailDialogProps {
  email: DetectedEmailWithCategory | null
  categories: EmailCategory[]
  orgId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EmailDetailDialog({
  email,
  categories,
  orgId,
  open,
  onOpenChange,
}: EmailDetailDialogProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  if (!email) return null

  const timeAgo = formatDistanceToNow(new Date(email.received_at), { addSuffix: true })
  const fullDate = format(new Date(email.received_at), "PPpp")

  async function updateEmail(updates: Record<string, unknown>) {
    if (!email) return
    setIsUpdating(true)
    try {
      await fetch(`/api/orgs/${orgId}/email/detected/${email.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      router.refresh()
    } catch (error) {
      console.error("Failed to update email:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  async function handleCategoryChange(categoryId: string) {
    await updateEmail({ categoryId: categoryId === "none" ? null : categoryId })
  }

  async function handleMarkRead() {
    if (!email) return
    await updateEmail({ isRead: !email.is_read })
  }

  async function handleArchive() {
    await updateEmail({ isArchived: true })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="text-sm font-medium leading-relaxed">
              {email.subject}
            </DialogTitle>
            {email.email_categories ? (
              <CategoryBadge
                name={email.email_categories.name}
                color={email.email_categories.color}
              />
            ) : (
              <UncategorizedBadge />
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {email.sender_name || email.sender_email}
            </span>
            {email.sender_name && (
              <span>&lt;{email.sender_email}&gt;</span>
            )}
          </div>
          <div className="text-[10px] text-muted-foreground" title={fullDate}>
            {timeAgo}
          </div>
        </DialogHeader>

        <div className="border-t border-border pt-4 mt-2">
          <div className="bg-muted/30 rounded-lg p-4 min-h-[200px]">
            <p className="text-xs/relaxed text-muted-foreground whitespace-pre-wrap">
              {email.snippet || "No preview available"}
            </p>
            <p className="text-xs/relaxed text-muted-foreground mt-4 italic">
              Full email content would be displayed here when connected to an email provider.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4 mt-4">
          <div className="flex items-center gap-2">
            <Tag className="size-3.5 text-muted-foreground" />
            <Select
              value={email.category_id || "none"}
              onValueChange={(v) => v && handleCategoryChange(v)}
              disabled={isUpdating}
            >
              <SelectTrigger className="w-[160px] h-7 text-xs">
                <SelectValue placeholder="Assign category">
                  {email.category_id
                    ? (email.email_categories?.name ||
                        categories.find((c) => c.id === email.category_id)?.name ||
                        "Unknown")
                    : "No category"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent sideOffset={4}>
                <SelectItem value="none">No category</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1"
              onClick={handleMarkRead}
              disabled={isUpdating}
            >
              {email.is_read ? (
                <>
                  <Mail className="size-3.5" />
                  Mark unread
                </>
              ) : (
                <>
                  <MailOpen className="size-3.5" />
                  Mark read
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1"
              onClick={handleArchive}
              disabled={isUpdating}
            >
              <Archive className="size-3.5" />
              Archive
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

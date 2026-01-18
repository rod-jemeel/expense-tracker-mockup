"use client"

import { useState } from "react"
import { EmailListItem, EmailListItemSkeleton } from "@/components/email/email-list-item"
import { EmailFilters } from "@/components/email/email-filters"
import { EmailDetailDialog } from "@/components/email/email-detail-dialog"
import { ListPagination } from "@/components/list-pagination"
import type { DetectedEmailWithCategory } from "@/lib/server/services/detected-emails"
import type { EmailCategory } from "@/lib/server/services/email-categories"

interface InboxContentClientProps {
  emails: DetectedEmailWithCategory[]
  categories: EmailCategory[]
  orgId: string
  total: number
  page: number
  limit: number
}

export function InboxContentClient({
  emails,
  categories,
  orgId,
  total,
  page,
  limit,
}: InboxContentClientProps) {
  const [selectedEmail, setSelectedEmail] = useState<DetectedEmailWithCategory | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  function handleEmailClick(email: DetectedEmailWithCategory) {
    setSelectedEmail(email)
    setDialogOpen(true)
  }

  if (emails.length === 0) {
    return (
      <div className="rounded-lg border overflow-hidden">
        <EmailFilters categories={categories} />
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">No emails found</p>
          <p className="text-xs text-muted-foreground">
            Connect an email account in Settings to start detecting emails
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <EmailFilters categories={categories} />
      <div className="divide-y divide-border">
        {emails.map((email) => (
          <EmailListItem
            key={email.id}
            id={email.id}
            subject={email.subject}
            senderEmail={email.sender_email}
            senderName={email.sender_name}
            receivedAt={email.received_at}
            snippet={email.snippet}
            isRead={email.is_read}
            category={email.email_categories || null}
            onClick={() => handleEmailClick(email)}
            isSelected={selectedEmail?.id === email.id}
          />
        ))}
      </div>
      {total > limit && (
        <div className="border-t border-border p-2">
          <ListPagination
            total={total}
            pageSize={limit}
            currentPage={page}
            basePath="/inbox"
          />
        </div>
      )}
      <EmailDetailDialog
        email={selectedEmail}
        categories={categories}
        orgId={orgId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}

export function InboxContentSkeleton() {
  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/30">
        <div className="h-7 w-[140px] bg-muted rounded animate-pulse" />
        <div className="h-7 w-[120px] bg-muted rounded animate-pulse" />
      </div>
      <div className="divide-y divide-border">
        {[1, 2, 3, 4, 5].map((i) => (
          <EmailListItemSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

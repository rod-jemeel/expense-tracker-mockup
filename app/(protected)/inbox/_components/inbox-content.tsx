import { listDetectedEmails } from "@/lib/server/services/detected-emails"
import { listEmailCategories } from "@/lib/server/services/email-categories"
import { InboxContentClient, InboxContentSkeleton } from "./inbox-content-client"

interface InboxContentProps {
  orgId: string
  searchParams: {
    category?: string
    status?: string
    page?: string
  }
}

export async function InboxContent({ orgId, searchParams }: InboxContentProps) {
  const page = parseInt(searchParams.page || "1", 10)
  const categoryId = searchParams.category === "uncategorized" ? undefined : searchParams.category
  const isRead = searchParams.status === "read" ? true : searchParams.status === "unread" ? false : undefined

  const [emailsData, categoriesData] = await Promise.all([
    listDetectedEmails({
      orgId,
      query: {
        page,
        limit: 20,
        categoryId: categoryId && categoryId !== "all" ? categoryId : undefined,
        isRead,
        isArchived: false,
      },
    }),
    listEmailCategories({
      orgId,
      query: { includeInactive: false },
    }),
  ])

  // For uncategorized filter, we need to filter client-side
  const filteredEmails = searchParams.category === "uncategorized"
    ? emailsData.items.filter((email) => !email.category_id)
    : emailsData.items

  return (
    <InboxContentClient
      emails={filteredEmails}
      categories={categoriesData.items}
      orgId={orgId}
      total={emailsData.total}
      page={emailsData.page}
      limit={emailsData.limit}
    />
  )
}

export { InboxContentSkeleton }

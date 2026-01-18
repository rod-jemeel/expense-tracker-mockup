import { Suspense } from "react"
import { redirect } from "next/navigation"
import { connection } from "next/server"
import { headers } from "next/headers"
import { Inbox } from "lucide-react"
import { auth } from "@/lib/auth"
import { InboxContent, InboxContentSkeleton } from "./_components/inbox-content"

interface PageProps {
  searchParams: Promise<{
    category?: string
    status?: string
    page?: string
  }>
}

async function InboxContentWithAuth({ searchParams }: { searchParams: PageProps["searchParams"] }) {
  await connection()

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/auth/sign-in")
  }

  if (!session.session.activeOrganizationId) {
    redirect("/org/select")
  }

  const orgId = session.session.activeOrganizationId
  const params = await searchParams

  return <InboxContent orgId={orgId} searchParams={params} />
}

export default async function InboxPage({ searchParams }: PageProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <Inbox className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-medium">Inbox</h1>
            <p className="text-xs text-muted-foreground">
              Detected emails from connected accounts
            </p>
          </div>
        </div>
      </div>

      <Suspense fallback={<InboxContentSkeleton />}>
        <InboxContentWithAuth searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

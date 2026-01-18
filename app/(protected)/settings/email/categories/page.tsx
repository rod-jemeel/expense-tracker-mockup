import { Suspense } from "react"
import { redirect } from "next/navigation"
import { connection } from "next/server"
import { headers } from "next/headers"
import { Tag } from "lucide-react"
import { auth } from "@/lib/auth"
import { EmailCategoryList, EmailCategoryListSkeleton } from "./_components/email-category-list"
import { NewEmailCategoryDialog } from "@/components/email/new-email-category-dialog"

async function EmailCategoryListWithAuth() {
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

  return <EmailCategoryList orgId={orgId} />
}

export default function EmailCategoriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <Tag className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-medium">Email Categories</h1>
            <p className="text-xs text-muted-foreground">
              Define categories to automatically sort incoming emails
            </p>
          </div>
        </div>
        <NewEmailCategoryDialog />
      </div>

      <Suspense fallback={<EmailCategoryListSkeleton />}>
        <EmailCategoryListWithAuth />
      </Suspense>
    </div>
  )
}

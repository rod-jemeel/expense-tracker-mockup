import { Suspense } from "react"
import dynamic from "next/dynamic"
import { redirect } from "next/navigation"
import { connection } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { RecurringTemplateList, RecurringTemplateListSkeleton } from "./_components/recurring-template-list"

// Dynamic import for dialog - reduces initial bundle (bundle-dynamic-imports pattern)
const NewTemplateDialog = dynamic(() =>
  import("./_components/new-template-dialog").then((mod) => mod.NewTemplateDialog)
)

// Server component that fetches data - wrapped in Suspense
async function RecurringTemplateListWithAuth({
  searchParams,
}: {
  searchParams: Promise<{
    categoryId?: string
    isActive?: string
    page?: string
  }>
}) {
  // Mark as dynamic - auth requires request headers
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

  const params = await searchParams
  const orgId = session.session.activeOrganizationId

  return (
    <RecurringTemplateList
      orgId={orgId}
      categoryId={params.categoryId}
      isActive={params.isActive !== "false"} // Default to showing active
      page={params.page ? parseInt(params.page, 10) : 1}
    />
  )
}

// Page renders static UI immediately, only data fetching is in Suspense
export default function RecurringExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{
    categoryId?: string
    isActive?: string
    page?: string
  }>
}) {
  return (
    <div className="flex flex-col h-full gap-6">
      {/* Static header - renders immediately */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-lg font-medium">Recurring Expenses</h1>
          <p className="text-xs text-muted-foreground">
            Manage templates for recurring monthly expenses
          </p>
        </div>
        {/* Client component using client-side auth state */}
        <NewTemplateDialog />
      </div>

      {/* Only the data list is in Suspense */}
      <div className="flex-1 min-h-0">
        <Suspense fallback={<RecurringTemplateListSkeleton />}>
          <RecurringTemplateListWithAuth searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  )
}

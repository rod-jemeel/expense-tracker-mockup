import { Suspense } from "react"
import { redirect } from "next/navigation"
import { connection } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { ExpenseFilters } from "./_components/expense-filters"
import { ExpenseList, ExpenseListSkeleton } from "./_components/expense-list"
import { NewExpenseDialog } from "./_components/new-expense-dialog"

// Server component that fetches data - wrapped in Suspense
async function ExpenseListWithAuth({
  searchParams,
}: {
  searchParams: Promise<{
    from?: string
    to?: string
    categoryId?: string
    vendor?: string
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
    <ExpenseList
      orgId={orgId}
      from={params.from}
      to={params.to}
      categoryId={params.categoryId}
      vendor={params.vendor}
      page={params.page ? parseInt(params.page, 10) : 1}
    />
  )
}

// Page renders static UI immediately, only data fetching is in Suspense
export default function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{
    from?: string
    to?: string
    categoryId?: string
    vendor?: string
    page?: string
  }>
}) {
  return (
    <div className="flex flex-col h-full gap-6">
      {/* Static header - renders immediately */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-lg font-medium">Expenses</h1>
          <p className="text-xs text-muted-foreground">
            Manage your organization&apos;s expenses
          </p>
        </div>
        {/* Client component using client-side auth state */}
        <NewExpenseDialog />
      </div>

      {/* Client component using useQueryState/useSearchParams - needs Suspense */}
      <div className="flex-shrink-0">
        <Suspense fallback={<div className="h-7" />}>
          <ExpenseFilters />
        </Suspense>
      </div>

      {/* Only the data list is in Suspense */}
      <div className="flex-1 min-h-0">
        <Suspense fallback={<ExpenseListSkeleton />}>
          <ExpenseListWithAuth searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  )
}

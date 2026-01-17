import { Suspense } from "react"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { MonthPicker } from "./_components/month-picker"
import { ExpenseSummary, ExpenseSummarySkeleton } from "./_components/expense-summary"
import { CategoryBreakdown, CategoryBreakdownSkeleton } from "./_components/category-breakdown"
import { InventoryMovers, InventoryMoversSkeleton } from "./_components/inventory-movers"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/auth/sign-in")
  }

  if (!session.session.activeOrganizationId) {
    redirect("/org/select")
  }

  const { month } = await searchParams
  const currentMonth = month || new Date().toISOString().slice(0, 7)
  const orgId = session.session.activeOrganizationId

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium">Dashboard</h1>
          <p className="text-xs text-muted-foreground">
            Overview of your expenses and inventory
          </p>
        </div>
        <MonthPicker currentMonth={currentMonth} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Suspense fallback={<ExpenseSummarySkeleton />}>
          <ExpenseSummary orgId={orgId} month={currentMonth} />
        </Suspense>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Suspense fallback={<CategoryBreakdownSkeleton />}>
          <CategoryBreakdown orgId={orgId} month={currentMonth} />
        </Suspense>

        <Suspense fallback={<InventoryMoversSkeleton />}>
          <InventoryMovers orgId={orgId} month={currentMonth} />
        </Suspense>
      </div>
    </div>
  )
}

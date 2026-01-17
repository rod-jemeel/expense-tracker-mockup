import { Suspense } from "react"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { isSuperadmin } from "@/lib/server/auth-helpers"
import { MonthPicker } from "../dashboard/_components/month-picker"
import { SuperDashboardClient } from "./_components/super-dashboard-client"
import { OrganizationList, OrganizationListSkeleton } from "./_components/organization-list"
import { getSuperDashboard, getSuperDashboardHistorical } from "@/lib/server/services/super-dashboard"
import { Skeleton } from "@/components/ui/skeleton"

async function SuperDashboardContent({ month }: { month: string }) {
  // Fetch all data in parallel
  const [dashboardData, historicalData] = await Promise.all([
    getSuperDashboard({ month }),
    getSuperDashboardHistorical({}),
  ])

  return (
    <SuperDashboardClient
      dashboardData={dashboardData}
      historicalData={historicalData}
    />
  )
}

function SuperDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Tab skeleton */}
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </div>

      {/* KPI cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-4">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-32" />
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="rounded-lg border border-border bg-card p-4">
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    </div>
  )
}

export default async function SuperDashboardPage({
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

  if (!isSuperadmin(session)) {
    redirect("/dashboard")
  }

  const { month } = await searchParams
  const currentMonth = month || new Date().toISOString().slice(0, 7)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium">Super Dashboard</h1>
          <p className="text-xs text-muted-foreground">
            Cross-organization overview and management
          </p>
        </div>
        <MonthPicker currentMonth={currentMonth} />
      </div>

      <Suspense fallback={<SuperDashboardSkeleton />}>
        <SuperDashboardContent month={currentMonth} />
      </Suspense>

      {/* Organization List */}
      <div className="grid gap-4 lg:grid-cols-1">
        <Suspense fallback={<OrganizationListSkeleton />}>
          <OrganizationList />
        </Suspense>
      </div>
    </div>
  )
}

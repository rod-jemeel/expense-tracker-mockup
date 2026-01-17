import { Suspense } from "react"
import { redirect } from "next/navigation"
import { connection } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { LayoutDashboard, Receipt, Package } from "lucide-react"
import { isSuperadmin } from "@/lib/server/auth-helpers"
import { MonthPicker } from "../dashboard/_components/month-picker"
import { SuperDashboardClient } from "./_components/super-dashboard-client"
import { OrganizationList, OrganizationListSkeleton } from "./_components/organization-list"
import { getSuperDashboard, getSuperDashboardHistorical } from "@/lib/server/services/super-dashboard"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Static tabs fallback - renders immediately with real tabs, not skeletons
function SuperDashboardTabsFallback() {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="overview" className="gap-1.5">
          <LayoutDashboard className="size-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="expenses" className="gap-1.5">
          <Receipt className="size-4" />
          Expenses
        </TabsTrigger>
        <TabsTrigger value="inventory" className="gap-1.5">
          <Package className="size-4" />
          Inventory
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <SuperDashboardContentSkeleton />
      </TabsContent>
    </Tabs>
  )
}

function SuperDashboardContentSkeleton() {
  return (
    <div className="space-y-6">
      {/* Key Metrics header - static, not skeleton */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">
          Key Metrics
        </h2>
        <Skeleton className="h-8 w-24" />
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

      {/* Chart skeleton - matches ChartContainer structure */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-4">
            <Skeleton className="h-5 w-36 mb-1" />
            <Skeleton className="h-3 w-52" />
          </div>
          <Skeleton className="h-[220px] w-full" />
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-4">
            <Skeleton className="h-5 w-40 mb-1" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-[220px] w-full" />
        </div>
      </div>
    </div>
  )
}

// Server component that fetches all super dashboard data - wrapped in Suspense
async function SuperDashboardContent({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  // Mark as dynamic - auth requires request headers
  await connection()

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

  // Fetch dashboard data
  const [dashboardData, historicalData] = await Promise.all([
    getSuperDashboard({ month: currentMonth }),
    getSuperDashboardHistorical({}),
  ])

  return (
    <>
      <SuperDashboardClient
        dashboardData={dashboardData}
        historicalData={historicalData}
      />

      {/* Organization List - nested in same auth context */}
      <div className="grid gap-4 lg:grid-cols-1">
        <Suspense fallback={<OrganizationListSkeleton />}>
          <OrganizationList />
        </Suspense>
      </div>
    </>
  )
}

// Page renders static UI immediately, only data fetching is in Suspense
export default function SuperDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  return (
    <div className="space-y-6">
      {/* Static header - renders immediately */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium">Super Dashboard</h1>
          <p className="text-xs text-muted-foreground">
            Cross-organization overview and management
          </p>
        </div>
        {/* Client component using useSearchParams - needs Suspense */}
        <Suspense fallback={<Skeleton className="h-9 w-32" />}>
          <MonthPicker />
        </Suspense>
      </div>

      {/* All super dashboard data in one Suspense - tabs show immediately in fallback */}
      <Suspense fallback={<SuperDashboardTabsFallback />}>
        <SuperDashboardContent searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

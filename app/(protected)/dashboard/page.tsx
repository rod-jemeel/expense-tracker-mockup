import { Suspense } from "react"
import { redirect } from "next/navigation"
import { connection } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { LayoutDashboard, Receipt, Package } from "lucide-react"
import { MonthPicker } from "./_components/month-picker"
import { DashboardClient } from "./_components/dashboard-client"
import { getDashboard, getDashboardHistorical } from "@/lib/server/services/dashboard"
import { supabase } from "@/lib/server/db"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Static tabs fallback - renders immediately with real tabs, not skeletons
function DashboardTabsFallback() {
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
        <DashboardContentSkeleton />
      </TabsContent>
    </Tabs>
  )
}

function DashboardContentSkeleton() {
  return (
    <div className="space-y-6">
      {/* Key Metrics header - static */}
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
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-[220px] w-full" />
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-4">
            <Skeleton className="h-5 w-36 mb-1" />
            <Skeleton className="h-3 w-44" />
          </div>
          <Skeleton className="h-[220px] w-full" />
        </div>
      </div>
    </div>
  )
}

// Server component that fetches data - wrapped in Suspense
async function DashboardDataWithAuth({
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

  if (!session.session.activeOrganizationId) {
    redirect("/org/select")
  }

  const { month } = await searchParams
  const currentMonth = month || new Date().toISOString().slice(0, 7)
  const orgId = session.session.activeOrganizationId

  // Fetch all data in parallel
  const [dashboardData, historicalData, itemsResult] = await Promise.all([
    getDashboard({ month: currentMonth, compare: "prev", orgId }),
    getDashboardHistorical({ orgId }),
    supabase
      .from("inventory_items")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId)
      .eq("is_active", true),
  ])

  const inventoryItemCount = itemsResult.count ?? 0

  return (
    <DashboardClient
      orgId={orgId}
      dashboardData={dashboardData}
      historicalData={historicalData}
      inventoryItemCount={inventoryItemCount}
    />
  )
}

// Page renders static UI immediately, only data fetching is in Suspense
export default function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  return (
    <div className="space-y-6">
      {/* Static header - renders immediately */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium">Dashboard</h1>
          <p className="text-xs text-muted-foreground">
            Overview of your expenses and inventory
          </p>
        </div>
        {/* Client component using useSearchParams - needs Suspense */}
        <Suspense fallback={<Skeleton className="h-9 w-32" />}>
          <MonthPicker />
        </Suspense>
      </div>

      {/* Dashboard tabs + data in Suspense - tabs show immediately in fallback */}
      <Suspense fallback={<DashboardTabsFallback />}>
        <DashboardDataWithAuth searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

import { HugeiconsIcon } from "@hugeicons/react"
import { DeliveryBox01Icon, ArrowUpRight01Icon, Building03Icon, ChartLineData03Icon } from "@hugeicons/core-free-icons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getSuperDashboard } from "@/lib/server/services/super-dashboard"

interface InventorySummaryProps {
  month: string
}

export async function InventorySummary({ month }: InventorySummaryProps) {
  const data = await getSuperDashboard({ month })

  const orgsWithInventory = data.inventoryByOrg.filter((org) => org.itemCount > 0).length
  const avgItemsPerOrg = data.organizationCount > 0
    ? Math.round(data.totalInventoryItems / data.organizationCount)
    : 0

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Inventory Items
          </CardTitle>
          <HugeiconsIcon icon={DeliveryBox01Icon} strokeWidth={2} className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold">{data.totalInventoryItems}</div>
          <p className="text-xs text-muted-foreground">
            tracked across all orgs
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Price Updates
          </CardTitle>
          <HugeiconsIcon icon={ArrowUpRight01Icon} strokeWidth={2} className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold">{data.totalPriceChanges}</div>
          <p className="text-xs text-muted-foreground">
            this month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Orgs with Inventory
          </CardTitle>
          <HugeiconsIcon icon={Building03Icon} strokeWidth={2} className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold">
            {orgsWithInventory} / {data.organizationCount}
          </div>
          <p className="text-xs text-muted-foreground">
            organizations tracking items
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Avg Items per Org
          </CardTitle>
          <HugeiconsIcon icon={ChartLineData03Icon} strokeWidth={2} className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold">{avgItemsPerOrg}</div>
          <p className="text-xs text-muted-foreground">
            inventory items average
          </p>
        </CardContent>
      </Card>
    </>
  )
}

export function InventorySummarySkeleton() {
  return (
    <>
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="size-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="mb-2 h-7 w-32" />
            <Skeleton className="h-3 w-40" />
          </CardContent>
        </Card>
      ))}
    </>
  )
}

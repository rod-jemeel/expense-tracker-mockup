"use client"

import { KpiCard, KpiGrid } from "@/components/dashboard/kpi-card"
import { OrgInventoryChart } from "../charts/org-inventory-chart"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface OrgInventoryData {
  orgId: string
  orgName: string
  itemCount: number
  priceChangeCount: number
}

interface PriceMover {
  itemId: string
  itemName: string
  orgId: string
  orgName: string
  oldPrice: number
  newPrice: number
  changePercent: number
}

interface InventoryData {
  totalItems: number
  priceUpdates: number
  organizationCount: number
  orgsWithInventory: number
  avgItemsPerOrg: number
  inventoryByOrg: OrgInventoryData[]
  topPriceMovers: PriceMover[]
}

interface InventoryContentProps {
  data: InventoryData
}

export function InventoryContent({ data }: InventoryContentProps) {
  const formatCurrency = (amount: number) => {
    if (amount < 1) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      }).format(amount)
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatPercent = (percent: number) => {
    const sign = percent >= 0 ? "+" : ""
    return `${sign}${percent.toFixed(1)}%`
  }

  return (
    <div className="space-y-6">
      <KpiGrid>
        <KpiCard kpiId="inventory_items" value={data.totalItems} />
        <KpiCard kpiId="price_updates" value={data.priceUpdates} />
        <KpiCard
          kpiId="orgs_with_inventory"
          value={`${data.orgsWithInventory} / ${data.organizationCount}`}
        />
        <KpiCard kpiId="avg_items_per_org" value={data.avgItemsPerOrg} />
      </KpiGrid>

      <div className="grid gap-4 md:grid-cols-2">
        <OrgInventoryChart data={data.inventoryByOrg} />

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Price Movers (All Orgs)
            </CardTitle>
            <CardDescription className="text-xs">
              Top price changes this month across all organizations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.topPriceMovers.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">
                No price changes this month
              </p>
            ) : (
              <div className="space-y-3">
                {data.topPriceMovers.slice(0, 6).map((mover) => (
                  <div
                    key={`${mover.orgId}-${mover.itemId}`}
                    className="flex items-center justify-between"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-medium">
                        {mover.itemName}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className="text-[9px] px-1 py-0"
                        >
                          {mover.orgName}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {formatCurrency(mover.oldPrice)} →{" "}
                          {formatCurrency(mover.newPrice)}
                        </span>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-1 text-xs font-medium",
                        mover.changePercent >= 0
                          ? "text-red-600"
                          : "text-green-600"
                      )}
                    >
                      {mover.changePercent >= 0 ? (
                        <TrendingUp className="size-3.5" />
                      ) : (
                        <TrendingDown className="size-3.5" />
                      )}
                      <span>{formatPercent(mover.changePercent)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

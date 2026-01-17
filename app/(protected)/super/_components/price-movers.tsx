import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUp01Icon, ArrowDown01Icon } from "@hugeicons/core-free-icons"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { getSuperDashboard } from "@/lib/server/services/super-dashboard"
import { cn } from "@/lib/utils"

interface PriceMoversProps {
  month: string
}

export async function PriceMovers({ month }: PriceMoversProps) {
  const data = await getSuperDashboard({ month })

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
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Price Movers (All Orgs)</CardTitle>
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
            {data.topPriceMovers.map((mover) => (
              <div
                key={`${mover.orgId}-${mover.itemId}`}
                className="flex items-center justify-between"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-medium">{mover.itemName}</span>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[9px] px-1 py-0">
                      {mover.orgName}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {formatCurrency(mover.oldPrice)} → {formatCurrency(mover.newPrice)}
                    </span>
                  </div>
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1 text-xs font-medium",
                    mover.changePercent >= 0 ? "text-red-600" : "text-green-600"
                  )}
                >
                  <HugeiconsIcon
                    icon={mover.changePercent >= 0 ? ArrowUp01Icon : ArrowDown01Icon}
                    strokeWidth={2}
                    className="size-3.5"
                  />
                  <span>{formatPercent(mover.changePercent)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function PriceMoversSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-56" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <Skeleton className="h-4 w-32" />
                <div className="flex items-center gap-1.5">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-5 w-14" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

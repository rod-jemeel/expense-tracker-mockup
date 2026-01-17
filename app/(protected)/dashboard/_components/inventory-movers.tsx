import { TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getDashboard } from "@/lib/server/services/dashboard"

interface InventoryMoversProps {
  orgId: string
  month: string
}

export async function InventoryMovers({ orgId, month }: InventoryMoversProps) {
  const data = await getDashboard({ month, compare: "none", orgId })

  const formatCurrency = (amount: number) => {
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
        <CardTitle className="text-sm">Price Movers</CardTitle>
      </CardHeader>
      <CardContent>
        {data.inventoryMovers.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No significant price changes this month
          </p>
        ) : (
          <div className="space-y-3">
            {data.inventoryMovers.slice(0, 5).map((item) => (
              <div
                key={item.itemId}
                className="flex items-center justify-between rounded-md border border-border p-2"
              >
                <div className="flex-1 min-w-0">
                  <p className="truncate text-xs font-medium">{item.itemName}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatCurrency(item.startPrice)} → {formatCurrency(item.endPrice)}
                  </p>
                </div>
                <div
                  className={`flex items-center gap-1 text-xs font-medium ${
                    item.percentChange >= 0 ? "text-destructive" : "text-green-500"
                  }`}
                >
                  {item.percentChange >= 0 ? (
                    <TrendingUp className="size-3" />
                  ) : (
                    <TrendingDown className="size-3" />
                  )}
                  <span>{formatPercent(item.percentChange)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function InventoryMoversSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-28" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-md border border-border p-2"
            >
              <div className="space-y-1">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-2 w-24" />
              </div>
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

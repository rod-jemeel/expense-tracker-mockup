import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getDashboard } from "@/lib/server/services/dashboard"

interface CategoryBreakdownProps {
  orgId: string
  month: string
}

export async function CategoryBreakdown({ orgId, month }: CategoryBreakdownProps) {
  const data = await getDashboard({ month, compare: "none", orgId })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Chart colors from design system
  const chartColors = [
    "bg-[oklch(0.837_0.128_66.29)]",
    "bg-[oklch(0.705_0.213_47.604)]",
    "bg-[oklch(0.646_0.222_41.116)]",
    "bg-[oklch(0.553_0.195_38.402)]",
    "bg-[oklch(0.47_0.157_37.304)]",
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Expenses by Category</CardTitle>
      </CardHeader>
      <CardContent>
        {data.categoryBreakdown.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No expenses recorded this month
          </p>
        ) : (
          <div className="space-y-3">
            {data.categoryBreakdown.slice(0, 5).map((category, index) => (
              <div key={category.categoryId} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{category.categoryName}</span>
                  <span className="text-muted-foreground">
                    {formatCurrency(category.total)}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full ${chartColors[index % chartColors.length]}`}
                    style={{ width: `${category.percentOfTotal}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function CategoryBreakdownSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-40" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

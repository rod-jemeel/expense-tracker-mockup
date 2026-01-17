import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUp01Icon, ArrowDown01Icon, DollarCircleIcon } from "@hugeicons/core-free-icons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getDashboard } from "@/lib/server/services/dashboard"

interface ExpenseSummaryProps {
  orgId: string
  month: string
}

export async function ExpenseSummary({ orgId, month }: ExpenseSummaryProps) {
  const data = await getDashboard({ month, compare: "prev", orgId })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercent = (percent: number | null) => {
    if (percent === null) return "N/A"
    const sign = percent >= 0 ? "+" : ""
    return `${sign}${percent.toFixed(1)}%`
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Total Expenses
          </CardTitle>
          <HugeiconsIcon icon={DollarCircleIcon} strokeWidth={2} className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold">
            {formatCurrency(data.totalExpenses)}
          </div>
          {data.momChange !== null && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {data.momChange >= 0 ? (
                <HugeiconsIcon icon={ArrowUp01Icon} strokeWidth={2} className="size-3 text-destructive" />
              ) : (
                <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} className="size-3 text-green-500" />
              )}
              <span>{formatPercent(data.momChange)} from last month</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Expense Count
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold">{data.expenseCount}</div>
          <p className="text-xs text-muted-foreground">
            transactions this month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Top Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold">
            {data.topDrivers[0]?.categoryName || "N/A"}
          </div>
          <p className="text-xs text-muted-foreground">
            {data.topDrivers[0]
              ? `${formatCurrency(data.topDrivers[0].total)} (${data.topDrivers[0].percentOfTotal.toFixed(0)}%)`
              : "No expenses yet"}
          </p>
        </CardContent>
      </Card>
    </>
  )
}

export function ExpenseSummarySkeleton() {
  return (
    <>
      {[1, 2, 3].map((i) => (
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

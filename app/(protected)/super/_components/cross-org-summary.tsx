import { HugeiconsIcon } from "@hugeicons/react"
import { Building03Icon, DollarCircleIcon, Invoice01Icon, ChartLineData03Icon } from "@hugeicons/core-free-icons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getSuperDashboard } from "@/lib/server/services/super-dashboard"

interface CrossOrgSummaryProps {
  month: string
}

export async function CrossOrgSummary({ month }: CrossOrgSummaryProps) {
  const data = await getSuperDashboard({ month })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const avgPerOrg = data.organizationCount > 0
    ? data.totalExpenses / data.organizationCount
    : 0

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Organizations
          </CardTitle>
          <HugeiconsIcon icon={Building03Icon} strokeWidth={2} className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold">{data.organizationCount}</div>
          <p className="text-xs text-muted-foreground">
            active organizations
          </p>
        </CardContent>
      </Card>

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
          <p className="text-xs text-muted-foreground">
            across all organizations
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Total Transactions
          </CardTitle>
          <HugeiconsIcon icon={Invoice01Icon} strokeWidth={2} className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold">{data.totalExpenseCount}</div>
          <p className="text-xs text-muted-foreground">
            expense records
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Avg per Org
          </CardTitle>
          <HugeiconsIcon icon={ChartLineData03Icon} strokeWidth={2} className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold">
            {formatCurrency(avgPerOrg)}
          </div>
          <p className="text-xs text-muted-foreground">
            average monthly spend
          </p>
        </CardContent>
      </Card>
    </>
  )
}

export function CrossOrgSummarySkeleton() {
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

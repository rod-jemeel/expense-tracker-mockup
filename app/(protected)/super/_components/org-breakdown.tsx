import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getSuperDashboard } from "@/lib/server/services/super-dashboard"

interface OrgBreakdownProps {
  month: string
}

export async function OrgBreakdown({ month }: OrgBreakdownProps) {
  const data = await getSuperDashboard({ month })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercent = (amount: number, total: number) => {
    if (total === 0) return "0%"
    return `${((amount / total) * 100).toFixed(1)}%`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Expense Breakdown by Organization</CardTitle>
        <CardDescription className="text-xs">
          Monthly expenses per organization
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.orgBreakdown.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">
            No expenses recorded this month
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Organization</TableHead>
                <TableHead className="text-right text-xs">Expenses</TableHead>
                <TableHead className="text-right text-xs">Count</TableHead>
                <TableHead className="text-right text-xs">% of Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.orgBreakdown.slice(0, 10).map((org) => (
                <TableRow key={org.orgId}>
                  <TableCell className="text-xs font-medium">{org.orgName}</TableCell>
                  <TableCell className="text-right text-xs">
                    {formatCurrency(org.totalExpenses)}
                  </TableCell>
                  <TableCell className="text-right text-xs">{org.expenseCount}</TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {formatPercent(org.totalExpenses, data.totalExpenses)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

export function OrgBreakdownSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-3 w-40" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { KpiCard, KpiGrid } from "@/components/dashboard/kpi-card"
import { CrossOrgTrendChart } from "../charts/cross-org-trend-chart"
import { OrgExpenseChart } from "../charts/org-expense-chart"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface HistoricalDataPoint {
  month: string
  label: string
  totalExpenses: number
  expenseCount: number
  inventoryItems: number
  priceUpdates: number
  organizationCount: number
}

interface OrgExpenseData {
  orgId: string
  orgName: string
  totalExpenses: number
  expenseCount: number
}

interface ExpenseData {
  totalExpenses: number
  expenseCount: number
  avgPerOrg: number
  organizationCount: number
  orgBreakdown: OrgExpenseData[]
}

interface ExpensesContentProps {
  data: ExpenseData
  historicalData: HistoricalDataPoint[]
}

export function ExpensesContent({ data, historicalData }: ExpensesContentProps) {
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
    <div className="space-y-6">
      <KpiGrid>
        <KpiCard kpiId="total_expenses" value={data.totalExpenses} />
        <KpiCard kpiId="expense_count" value={data.expenseCount} />
        <KpiCard kpiId="org_count" value={data.organizationCount} />
        <KpiCard kpiId="avg_expense" value={data.avgPerOrg} />
      </KpiGrid>

      <div className="grid gap-4 md:grid-cols-2">
        <CrossOrgTrendChart data={historicalData} />
        <OrgExpenseChart data={data.orgBreakdown} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Expense Breakdown by Organization
          </CardTitle>
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
                    <TableCell className="text-xs font-medium">
                      {org.orgName}
                    </TableCell>
                    <TableCell className="text-right text-xs">
                      {formatCurrency(org.totalExpenses)}
                    </TableCell>
                    <TableCell className="text-right text-xs">
                      {org.expenseCount}
                    </TableCell>
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
    </div>
  )
}

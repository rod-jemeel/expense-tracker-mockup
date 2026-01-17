"use client"

import { ChartContainer } from "@/components/charts/chart-container"
import { BarChart } from "@/components/charts/bar-chart"

interface OrgExpenseData {
  orgId: string
  orgName: string
  totalExpenses: number
  expenseCount: number
}

interface OrgExpenseChartProps {
  data: OrgExpenseData[]
}

export function OrgExpenseChart({ data }: OrgExpenseChartProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}k`
    }
    return `$${value}`
  }

  const formatTooltip = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Transform data for the chart - take top 5 orgs
  const chartData = data.slice(0, 5).map((org) => ({
    name: org.orgName.length > 12
      ? org.orgName.slice(0, 12) + "..."
      : org.orgName,
    amount: org.totalExpenses,
  }))

  return (
    <ChartContainer
      title="Expenses by Organization"
      description="Top organizations by monthly spending"
    >
      <BarChart
        data={chartData}
        xKey="name"
        yKey="amount"
        height={220}
        formatYAxis={formatCurrency}
        formatTooltip={formatTooltip}
        horizontal
      />
    </ChartContainer>
  )
}

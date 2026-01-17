"use client"

import { ChartContainer } from "@/components/charts/chart-container"
import { AreaChart } from "@/components/charts/area-chart"

interface HistoricalDataPoint {
  month: string
  label: string
  totalExpenses: number
  expenseCount: number
  inventoryItems: number
  priceUpdates: number
  organizationCount: number
}

interface CrossOrgTrendChartProps {
  data: HistoricalDataPoint[]
}

export function CrossOrgTrendChart({ data }: CrossOrgTrendChartProps) {
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

  return (
    <ChartContainer
      title="Cross-Organization Expense Trend"
      description="Total expenses across all organizations over time"
    >
      <AreaChart
        data={data}
        xKey="label"
        yKeys={["totalExpenses"]}
        yLabels={{ totalExpenses: "Total Expenses" }}
        height={220}
        formatYAxis={formatCurrency}
        formatTooltip={formatTooltip}
      />
    </ChartContainer>
  )
}

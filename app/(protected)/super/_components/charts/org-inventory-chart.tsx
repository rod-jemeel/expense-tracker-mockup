"use client"

import { ChartContainer } from "@/components/charts/chart-container"
import { BarChart } from "@/components/charts/bar-chart"

interface OrgInventoryData {
  orgId: string
  orgName: string
  itemCount: number
  priceChangeCount: number
}

interface OrgInventoryChartProps {
  data: OrgInventoryData[]
}

export function OrgInventoryChart({ data }: OrgInventoryChartProps) {
  const formatNumber = (value: number) => {
    return value.toString()
  }

  // Transform data for the chart - take top 5 orgs by item count
  const chartData = data
    .filter((org) => org.itemCount > 0)
    .slice(0, 5)
    .map((org) => ({
      name: org.orgName.length > 12
        ? org.orgName.slice(0, 12) + "..."
        : org.orgName,
      items: org.itemCount,
    }))

  if (chartData.length === 0) {
    return (
      <ChartContainer
        title="Inventory by Organization"
        description="Items tracked per organization"
      >
        <div className="flex items-center justify-center h-[220px] text-muted-foreground text-sm">
          No inventory data available
        </div>
      </ChartContainer>
    )
  }

  return (
    <ChartContainer
      title="Inventory by Organization"
      description="Items tracked per organization"
    >
      <BarChart
        data={chartData}
        xKey="name"
        yKey="items"
        height={220}
        formatYAxis={formatNumber}
        formatTooltip={(v) => `${v} items`}
        horizontal
      />
    </ChartContainer>
  )
}

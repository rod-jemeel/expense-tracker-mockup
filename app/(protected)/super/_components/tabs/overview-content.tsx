"use client"

import { KpiCard, KpiGrid } from "@/components/dashboard/kpi-card"
import { KpiSelector } from "@/components/dashboard/kpi-selector"
import { useKpiSelection } from "@/lib/hooks/use-kpi-selection"
import { KpiId } from "@/lib/kpi-registry"
import { CrossOrgTrendChart } from "../charts/cross-org-trend-chart"

interface HistoricalDataPoint {
  month: string
  label: string
  totalExpenses: number
  expenseCount: number
  inventoryItems: number
  priceUpdates: number
  organizationCount: number
}

interface KpiData {
  total_expenses: number
  expense_count: number
  avg_expense: number
  top_category: null
  mom_change: null
  inventory_items: number
  price_updates: number
  top_increase: number | null
  top_decrease: number | null
  org_count: number
  orgs_with_inventory: string
  avg_items_per_org: number
}

interface OverviewContentProps {
  kpiData: KpiData
  historicalData: HistoricalDataPoint[]
}

export function OverviewContent({
  kpiData,
  historicalData,
}: OverviewContentProps) {
  const { selectedKpis } = useKpiSelection("super")

  const getKpiValue = (kpiId: KpiId): number | string | null => {
    switch (kpiId) {
      case "total_expenses":
        return kpiData.total_expenses
      case "expense_count":
        return kpiData.expense_count
      case "avg_expense":
        return kpiData.avg_expense
      case "inventory_items":
        return kpiData.inventory_items
      case "price_updates":
        return kpiData.price_updates
      case "top_increase":
        return kpiData.top_increase
      case "top_decrease":
        return kpiData.top_decrease
      case "org_count":
        return kpiData.org_count
      case "orgs_with_inventory":
        return kpiData.orgs_with_inventory
      case "avg_items_per_org":
        return kpiData.avg_items_per_org
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">
          Key Metrics
        </h2>
        <KpiSelector variant="super" />
      </div>

      <KpiGrid>
        {selectedKpis.map((kpiId) => (
          <KpiCard key={kpiId} kpiId={kpiId} value={getKpiValue(kpiId)} />
        ))}
      </KpiGrid>

      <CrossOrgTrendChart data={historicalData} />
    </div>
  )
}

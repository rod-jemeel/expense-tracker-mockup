"use client"

import { ChartContainer } from "@/components/charts/chart-container"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"

interface VendorData {
  vendor: string
  total: number
  count: number
  percentOfTotal: number
}

interface TopVendorsTableProps {
  data: VendorData[]
  maxHeight?: number
}

export function TopVendorsTable({
  data,
  maxHeight = 300,
}: TopVendorsTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  if (!data || data.length === 0) {
    return (
      <ChartContainer
        title="Top Vendors"
        description="Vendors ranked by spending"
      >
        <div
          className="flex items-center justify-center text-muted-foreground text-sm"
          style={{ height: maxHeight }}
        >
          No vendor data available
        </div>
      </ChartContainer>
    )
  }

  return (
    <ChartContainer
      title="Top Vendors"
      description="Vendors ranked by spending"
    >
      <div
        className="overflow-auto"
        style={{ maxHeight }}
      >
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10 border-b-2 border-primary/20">
            <TableRow>
              <TableHead>Vendor</TableHead>
              <TableHead className="text-right">Expenses</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-[100px]">Share</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((vendor, index) => (
              <TableRow key={vendor.vendor || index}>
                <TableCell className="font-medium">
                  {vendor.vendor || "Unknown"}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {vendor.count}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(vendor.total)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={vendor.percentOfTotal} className="h-2" />
                    <span className="text-xs text-muted-foreground w-10">
                      {vendor.percentOfTotal.toFixed(0)}%
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ChartContainer>
  )
}

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
import { Badge } from "@/components/ui/badge"

interface CategoryData {
  categoryId: string
  categoryName: string
  total: number
  count: number
  percentOfTotal: number
}

interface CategorySummaryTableProps {
  data: CategoryData[]
  maxHeight?: number
}

export function CategorySummaryTable({
  data,
  maxHeight = 300,
}: CategorySummaryTableProps) {
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
        title="Category Summary"
        description="Spending breakdown by category"
      >
        <div
          className="flex items-center justify-center text-muted-foreground text-sm"
          style={{ height: maxHeight }}
        >
          No category data available
        </div>
      </ChartContainer>
    )
  }

  return (
    <ChartContainer
      title="Category Summary"
      description="Spending breakdown by category"
    >
      <div
        className="overflow-auto"
        style={{ maxHeight }}
      >
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10 border-b-2 border-primary/20">
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Entries</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-[100px]">Share</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((category) => (
              <TableRow key={category.categoryId}>
                <TableCell>
                  <Badge variant="outline">{category.categoryName}</Badge>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {category.count}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(category.total)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={category.percentOfTotal} className="h-2" />
                    <span className="text-xs text-muted-foreground w-10">
                      {category.percentOfTotal.toFixed(0)}%
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

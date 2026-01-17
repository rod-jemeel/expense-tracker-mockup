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
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUp01Icon, ArrowDown01Icon } from "@hugeicons/core-free-icons"

interface PriceChange {
  itemId: string
  itemName: string
  oldPrice: number
  newPrice: number
  change: number
  percentChange: number
  date: string
}

interface RecentPriceChangesTableProps {
  data: PriceChange[]
  maxHeight?: number
}

export function RecentPriceChangesTable({
  data,
  maxHeight = 300,
}: RecentPriceChangesTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  if (!data || data.length === 0) {
    return (
      <ChartContainer
        title="Recent Price Changes"
        description="Latest price updates"
      >
        <div
          className="flex items-center justify-center text-muted-foreground text-sm"
          style={{ height: maxHeight }}
        >
          No price changes recorded
        </div>
      </ChartContainer>
    )
  }

  return (
    <ChartContainer
      title="Recent Price Changes"
      description="Latest price updates"
    >
      <div
        className="overflow-auto"
        style={{ maxHeight }}
      >
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10 border-b-2 border-primary/20">
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead className="text-right">Old Price</TableHead>
              <TableHead className="text-right">New Price</TableHead>
              <TableHead className="text-right">Change</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={`${item.itemId}-${index}`}>
                <TableCell className="font-medium">{item.itemName}</TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatCurrency(item.oldPrice)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(item.newPrice)}
                </TableCell>
                <TableCell className="text-right">
                  <div
                    className={`flex items-center justify-end gap-1 ${
                      item.change >= 0 ? "text-destructive" : "text-green-500"
                    }`}
                  >
                    {item.change >= 0 ? (
                      <HugeiconsIcon icon={ArrowUp01Icon} strokeWidth={2} className="size-3" />
                    ) : (
                      <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} className="size-3" />
                    )}
                    <span>
                      {item.change >= 0 ? "+" : ""}
                      {item.percentChange.toFixed(1)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(item.date)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ChartContainer>
  )
}

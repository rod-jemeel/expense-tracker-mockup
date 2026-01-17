import { listRecurringTemplates } from "@/lib/server/services/recurring-templates"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ListPagination } from "@/components/list-pagination"
import { RecurringTemplateActions } from "./recurring-template-actions"

const PAGE_SIZE = 20

interface RecurringTemplateListProps {
  orgId: string
  categoryId?: string
  isActive?: boolean
  page?: number
}

export async function RecurringTemplateList({
  orgId,
  categoryId,
  isActive = true,
  page = 1,
}: RecurringTemplateListProps) {
  const data = await listRecurringTemplates({
    query: {
      categoryId,
      isActive,
      page,
      limit: PAGE_SIZE,
    },
    orgId,
  })

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "-"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDayOfMonth = (day: number | null) => {
    if (day === null) return "-"
    // Add ordinal suffix
    const suffix = ["th", "st", "nd", "rd"]
    const v = day % 100
    return day + (suffix[(v - 20) % 10] || suffix[v] || suffix[0])
  }

  if (data.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
        <p className="text-sm text-muted-foreground">No recurring templates found</p>
        <p className="text-xs text-muted-foreground">
          Create a template for expenses that repeat monthly
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex-1 min-h-0 rounded-lg border overflow-hidden">
        <Table containerClassName="h-full">
          <TableHeader className="sticky top-0 bg-card z-10 border-b-2 border-primary/20">
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead className="text-right">Est. Amount</TableHead>
              <TableHead className="text-center">Day</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((template) => (
              <TableRow key={template.id}>
                <TableCell>
                  <Badge variant="secondary" className="text-[10px]">
                    {template.expense_categories?.name || "Uncategorized"}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs">
                  {template.vendor || "-"}
                </TableCell>
                <TableCell className="text-right text-xs font-medium">
                  {formatCurrency(template.estimated_amount)}
                </TableCell>
                <TableCell className="text-center text-xs text-muted-foreground">
                  {formatDayOfMonth(template.typical_day_of_month)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant={template.is_active ? "default" : "secondary"}
                    className="text-[10px]"
                  >
                    {template.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <RecurringTemplateActions template={template} orgId={orgId} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex-shrink-0">
        <ListPagination
          total={data.total}
          pageSize={PAGE_SIZE}
          currentPage={page}
        />
      </div>
    </div>
  )
}

export function RecurringTemplateListSkeleton() {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category</TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead className="text-right">Est. Amount</TableHead>
            <TableHead className="text-center">Day</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3, 4, 5].map((i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-5 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="ml-auto h-4 w-16" />
              </TableCell>
              <TableCell className="text-center">
                <Skeleton className="mx-auto h-4 w-8" />
              </TableCell>
              <TableCell className="text-center">
                <Skeleton className="mx-auto h-5 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="size-5" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

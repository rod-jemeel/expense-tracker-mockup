import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getAllOrganizations } from "@/lib/server/services/super-dashboard"
import { formatDistanceToNow } from "date-fns"

export async function OrganizationList() {
  const organizations = await getAllOrganizations()

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getActivityStatus = (lastActivityAt: string | null | undefined): {
    label: string
    variant: "default" | "secondary" | "outline"
  } => {
    if (!lastActivityAt) {
      return { label: "No activity", variant: "outline" }
    }

    const daysSinceActivity = Math.floor(
      (Date.now() - new Date(lastActivityAt).getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysSinceActivity <= 7) {
      return { label: "Active", variant: "default" }
    } else if (daysSinceActivity <= 30) {
      return { label: "Recent", variant: "secondary" }
    } else {
      return { label: "Inactive", variant: "outline" }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">All Organizations</CardTitle>
        <CardDescription className="text-xs">
          {organizations.length} organizations registered
        </CardDescription>
      </CardHeader>
      <CardContent>
        {organizations.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">
            No organizations found
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10 border-b-2 border-primary/20">
                <TableRow>
                  <TableHead className="text-xs">Organization</TableHead>
                  <TableHead className="text-right text-xs">Members</TableHead>
                  <TableHead className="text-right text-xs">Monthly Expenses</TableHead>
                  <TableHead className="text-right text-xs">Inventory</TableHead>
                  <TableHead className="text-center text-xs">Status</TableHead>
                  <TableHead className="text-right text-xs">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizations.slice(0, 10).map((org) => {
                  const activityStatus = getActivityStatus(org.lastActivityAt)

                  return (
                    <TableRow key={org.id}>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-medium">{org.name}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {org.slug}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary" className="text-[10px]">
                          {org.memberCount}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-xs tabular-nums">
                        {formatCurrency(org.monthlyExpenses ?? 0)}
                      </TableCell>
                      <TableCell className="text-right text-xs tabular-nums">
                        {org.inventoryItemCount ?? 0} items
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={activityStatus.variant}
                          className="text-[10px]"
                        >
                          {activityStatus.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {formatDate(org.createdAt)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function OrganizationListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-3 w-40" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-5 w-10" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-14" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

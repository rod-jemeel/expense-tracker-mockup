import { listEmailCategories } from "@/lib/server/services/email-categories"
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
import { CategoryBadge } from "@/components/email/category-badge"
import { EditEmailCategoryDialog } from "@/components/email/edit-email-category-dialog"
import { DeleteEmailCategoryButton } from "@/components/email/delete-email-category-button"

interface EmailCategoryListProps {
  orgId: string
}

export async function EmailCategoryList({ orgId }: EmailCategoryListProps) {
  const data = await listEmailCategories({
    orgId,
    query: { includeInactive: true },
  })

  if (data.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
        <p className="text-sm text-muted-foreground">No email categories yet</p>
        <p className="text-xs text-muted-foreground">
          Create your first category to start organizing emails
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table containerClassName="h-full">
        <TableHeader className="sticky top-0 bg-card z-10 border-b-2 border-primary/20">
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Keywords</TableHead>
            <TableHead>Sender Patterns</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.items.map((category) => (
            <TableRow key={category.id}>
              <TableCell>
                <CategoryBadge name={category.name} color={category.color} />
              </TableCell>
              <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                {category.keywords && category.keywords.length > 0
                  ? category.keywords.join(", ")
                  : "—"}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                {category.sender_patterns && category.sender_patterns.length > 0
                  ? category.sender_patterns.join(", ")
                  : "—"}
              </TableCell>
              <TableCell>
                <Badge
                  variant={category.is_active ? "default" : "secondary"}
                  className="text-[10px]"
                >
                  {category.is_active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <EditEmailCategoryDialog category={category} orgId={orgId} />
                  <DeleteEmailCategoryButton
                    categoryId={category.id}
                    categoryName={category.name}
                    orgId={orgId}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function EmailCategoryListSkeleton() {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Keywords</TableHead>
            <TableHead>Sender Patterns</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3, 4].map((i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-5 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-28" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-14" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-16" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const colorMap: Record<string, string> = {
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  green: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  yellow: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  red: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  gray: "bg-muted text-muted-foreground border-border",
}

interface CategoryBadgeProps {
  name: string
  color: string
  className?: string
}

export function CategoryBadge({ name, color, className }: CategoryBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] font-medium border",
        colorMap[color] || colorMap.gray,
        className
      )}
    >
      {name}
    </Badge>
  )
}

export function UncategorizedBadge({ className }: { className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] font-medium border border-dashed",
        "bg-muted/50 text-muted-foreground border-border",
        className
      )}
    >
      Uncategorized
    </Badge>
  )
}

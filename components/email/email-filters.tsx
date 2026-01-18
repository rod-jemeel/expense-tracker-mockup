"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Filter, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { EmailCategory } from "@/lib/server/services/email-categories"

interface EmailFiltersProps {
  categories: EmailCategory[]
  onRefresh?: () => void
  isRefreshing?: boolean
}

export function EmailFilters({ categories, onRefresh, isRefreshing }: EmailFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentCategory = searchParams.get("category") || "all"
  const currentStatus = searchParams.get("status") || "all"

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.delete("page") // Reset page when filter changes
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/30">
      <Filter className="size-3.5 text-muted-foreground" />

      <Select value={currentCategory} onValueChange={(v) => v && updateFilter("category", v)}>
        <SelectTrigger className="w-[140px] h-7 text-xs">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          <SelectItem value="uncategorized">Uncategorized</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={currentStatus} onValueChange={(v) => v && updateFilter("status", v)}>
        <SelectTrigger className="w-[120px] h-7 text-xs">
          <SelectValue placeholder="All emails" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All emails</SelectItem>
          <SelectItem value="unread">Unread</SelectItem>
          <SelectItem value="read">Read</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex-1" />

      {onRefresh && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={cn("size-3.5", isRefreshing && "animate-spin")} />
          Sync
        </Button>
      )}
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

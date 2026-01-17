"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"

interface MonthPickerProps {
  currentMonth: string // YYYY-MM format
}

export function MonthPicker({ currentMonth }: MonthPickerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [year, month] = currentMonth.split("-").map(Number)
  const date = new Date(year, month - 1, 1)

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  const navigateMonth = (delta: number) => {
    const newDate = new Date(year, month - 1 + delta, 1)
    const newMonth = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, "0")}`
    const params = new URLSearchParams(searchParams.toString())
    params.set("month", newMonth)
    router.push(`?${params.toString()}`)
  }

  const isCurrentMonth = () => {
    const now = new Date()
    return year === now.getFullYear() && month === now.getMonth() + 1
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => navigateMonth(-1)}
        aria-label="Previous month"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
      </Button>
      <span className="min-w-32 text-center text-sm font-medium">
        {formatMonth(date)}
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => navigateMonth(1)}
        disabled={isCurrentMonth()}
        aria-label="Next month"
      >
        <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
      </Button>
    </div>
  )
}

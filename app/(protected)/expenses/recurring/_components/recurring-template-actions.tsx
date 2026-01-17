"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  MoreHorizontalIcon,
  PlusSignIcon,
  Edit01Icon,
  Delete01Icon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreateFromTemplateDialog } from "./create-from-template-dialog"
import { EditTemplateDialog } from "./edit-template-dialog"

interface RecurringTemplate {
  id: string
  org_id: string
  category_id: string
  vendor: string | null
  estimated_amount: number | null
  notes: string | null
  frequency: string
  typical_day_of_month: number | null
  is_active: boolean
  expense_categories: { id: string; name: string } | null
}

interface RecurringTemplateActionsProps {
  template: RecurringTemplate
  orgId: string
}

export function RecurringTemplateActions({
  template,
  orgId,
}: RecurringTemplateActionsProps) {
  const router = useRouter()
  const [showCreateExpense, setShowCreateExpense] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleToggleActive() {
    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/orgs/${orgId}/recurring-templates/${template.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !template.is_active }),
        }
      )

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to toggle template status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this template?")) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/orgs/${orgId}/recurring-templates/${template.id}`,
        {
          method: "DELETE",
        }
      )

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to delete template:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="size-7" disabled={isLoading} />}>
          <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} className="size-4" />
          <span className="sr-only">Actions</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowCreateExpense(true)}>
            <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="size-3.5" />
            Create Expense
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowEdit(true)}>
            <HugeiconsIcon icon={Edit01Icon} strokeWidth={2} className="size-3.5" />
            Edit Template
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleActive}>
            <HugeiconsIcon
              icon={CheckmarkCircle01Icon}
              strokeWidth={2}
              className="size-3.5"
            />
            {template.is_active ? "Deactivate" : "Activate"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
          >
            <HugeiconsIcon icon={Delete01Icon} strokeWidth={2} className="size-3.5" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateFromTemplateDialog
        template={template}
        orgId={orgId}
        open={showCreateExpense}
        onOpenChange={setShowCreateExpense}
      />

      <EditTemplateDialog
        template={template}
        orgId={orgId}
        open={showEdit}
        onOpenChange={setShowEdit}
      />
    </>
  )
}

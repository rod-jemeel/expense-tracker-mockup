"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  MoreHorizontalCircle01Icon,
  PencilEdit01Icon,
  Delete01Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

interface Category {
  id: string
  name: string
}

interface Expense {
  id: string
  expense_date: string
  category_id: string
  amount: number
  vendor: string | null
  notes: string | null
  expense_categories: { id: string; name: string } | null
}

interface ExpenseActionsProps {
  expense: Expense
  orgId: string
}

export function ExpenseActions({ expense, orgId }: ExpenseActionsProps) {
  const router = useRouter()
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])

  const [formData, setFormData] = useState({
    expenseDate: expense.expense_date,
    categoryId: expense.category_id,
    amount: expense.amount.toString(),
    vendor: expense.vendor || "",
    notes: expense.notes || "",
  })

  function handleEditClick() {
    // Fetch categories when opening edit dialog
    fetch(`/api/orgs/${orgId}/categories`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data?.items) {
          setCategories(data.data.items)
        }
      })
      .catch(console.error)

    // Use setTimeout to ensure dialog opens after dropdown fully closes
    setTimeout(() => {
      setEditDialogOpen(true)
    }, 0)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch(`/api/orgs/${orgId}/expenses/${expense.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expenseDate: formData.expenseDate,
          categoryId: formData.categoryId,
          amount: parseFloat(formData.amount),
          vendor: formData.vendor || null,
          notes: formData.notes || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error?.message || "Failed to update expense")
      }

      setEditDialogOpen(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
          <HugeiconsIcon icon={MoreHorizontalCircle01Icon} strokeWidth={2} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleEditClick()}>
            <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={2} className="size-3.5" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive">
            <HugeiconsIcon icon={Delete01Icon} strokeWidth={2} className="size-3.5" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>Update the details for this expense</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {error && (
                <FieldError className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                  {error}
                </FieldError>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="expenseDate">Date</FieldLabel>
                  <Input
                    id="expenseDate"
                    type="date"
                    value={formData.expenseDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        expenseDate: e.target.value,
                      }))
                    }
                    disabled={isLoading}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="amount">Amount</FieldLabel>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, amount: e.target.value }))
                    }
                    disabled={isLoading}
                    required
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="categoryId">Category</FieldLabel>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => {
                    if (value) {
                      setFormData((prev) => ({ ...prev, categoryId: value }))
                    }
                  }}
                  disabled={isLoading}
                >
                  <SelectTrigger id="categoryId">
                    <SelectValue placeholder="Select a category">
                      {categories.find((c) => c.id === formData.categoryId)?.name ||
                        expense.expense_categories?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {categories.length === 0 && (
                  <FieldDescription>
                    No categories found. Create one in Settings.
                  </FieldDescription>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="vendor">Vendor (optional)</FieldLabel>
                <Input
                  id="vendor"
                  placeholder="e.g., Office Supplies Inc."
                  value={formData.vendor}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, vendor: e.target.value }))
                  }
                  disabled={isLoading}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="notes">Notes (optional)</FieldLabel>
                <Textarea
                  id="notes"
                  placeholder="Any additional details..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  disabled={isLoading}
                  rows={3}
                />
              </Field>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </FieldGroup>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

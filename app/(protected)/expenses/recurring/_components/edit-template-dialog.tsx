"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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

interface EditTemplateDialogProps {
  template: RecurringTemplate
  orgId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditTemplateDialog({
  template,
  orgId,
  open,
  onOpenChange,
}: EditTemplateDialogProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])

  const [formData, setFormData] = useState({
    categoryId: template.category_id,
    vendor: template.vendor || "",
    estimatedAmount: template.estimated_amount?.toString() || "",
    typicalDayOfMonth: template.typical_day_of_month?.toString() || "",
    notes: template.notes || "",
  })

  // Initialize form data and fetch categories when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        categoryId: template.category_id,
        vendor: template.vendor || "",
        estimatedAmount: template.estimated_amount?.toString() || "",
        typicalDayOfMonth: template.typical_day_of_month?.toString() || "",
        notes: template.notes || "",
      })
      setError(null)

      // Fetch categories
      fetch(`/api/orgs/${orgId}/categories`)
        .then((res) => res.json())
        .then((data) => {
          if (data.data?.items) {
            setCategories(data.data.items)
          }
        })
        .catch(console.error)
    }
  }, [open, template, orgId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch(
        `/api/orgs/${orgId}/recurring-templates/${template.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            categoryId: formData.categoryId,
            vendor: formData.vendor || null,
            estimatedAmount: formData.estimatedAmount
              ? parseFloat(formData.estimatedAmount)
              : null,
            typicalDayOfMonth: formData.typicalDayOfMonth
              ? parseInt(formData.typicalDayOfMonth, 10)
              : null,
            notes: formData.notes || null,
          }),
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error?.message || "Failed to update template")
      }

      onOpenChange(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Recurring Template</DialogTitle>
          <DialogDescription>
            Update the details for this recurring expense template
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            {error && (
              <FieldError className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                {error}
              </FieldError>
            )}

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
                required
              >
                <SelectTrigger id="categoryId">
                  <SelectValue placeholder="Select a category">
                    {categories.find((c) => c.id === formData.categoryId)?.name}
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
            </Field>

            <Field>
              <FieldLabel htmlFor="vendor">Vendor</FieldLabel>
              <Input
                id="vendor"
                placeholder="e.g., Electric Company, Internet Provider"
                value={formData.vendor}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, vendor: e.target.value }))
                }
                disabled={isLoading}
              />
              <FieldDescription>
                The vendor or company for this recurring expense
              </FieldDescription>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="estimatedAmount">Estimated Amount</FieldLabel>
                <Input
                  id="estimatedAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.estimatedAmount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      estimatedAmount: e.target.value,
                    }))
                  }
                  disabled={isLoading}
                />
                <FieldDescription>Typical monthly amount</FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="typicalDayOfMonth">Day of Month</FieldLabel>
                <Input
                  id="typicalDayOfMonth"
                  type="number"
                  min="1"
                  max="31"
                  placeholder="e.g., 15"
                  value={formData.typicalDayOfMonth}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      typicalDayOfMonth: e.target.value,
                    }))
                  }
                  disabled={isLoading}
                />
                <FieldDescription>When bill is typically due</FieldDescription>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="notes">Notes (optional)</FieldLabel>
              <Textarea
                id="notes"
                placeholder="Account number, payment details, etc."
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
                onClick={() => onOpenChange(false)}
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
  )
}

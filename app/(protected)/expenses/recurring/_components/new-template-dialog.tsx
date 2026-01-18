"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon } from "@hugeicons/core-free-icons"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { FileImage } from "lucide-react"
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
  DialogTrigger,
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

export function NewTemplateDialog() {
  const router = useRouter()
  const { data: activeOrg } = authClient.useActiveOrganization()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])

  const [formData, setFormData] = useState({
    categoryId: "",
    vendor: "",
    estimatedAmount: "",
    typicalDayOfMonth: "",
    notes: "",
  })

  const orgId = activeOrg?.id

  useEffect(() => {
    if (open && orgId) {
      // Fetch categories when dialog opens
      fetch(`/api/orgs/${orgId}/categories`)
        .then((res) => res.json())
        .then((data) => {
          if (data.data?.items) {
            setCategories(data.data.items)
          }
        })
        .catch(console.error)
    }
  }, [open, orgId])

  function resetForm() {
    setFormData({
      categoryId: "",
      vendor: "",
      estimatedAmount: "",
      typicalDayOfMonth: "",
      notes: "",
    })
    setError(null)
  }

  function handleOpenChange(newOpen: boolean) {
    setOpen(newOpen)
    if (!newOpen) {
      resetForm()
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!orgId) {
      setError("No organization selected")
      return
    }
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch(`/api/orgs/${orgId}/recurring-templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: formData.categoryId,
          vendor: formData.vendor || undefined,
          estimatedAmount: formData.estimatedAmount
            ? parseFloat(formData.estimatedAmount)
            : undefined,
          typicalDayOfMonth: formData.typicalDayOfMonth
            ? parseInt(formData.typicalDayOfMonth, 10)
            : undefined,
          notes: formData.notes || undefined,
          frequency: "monthly",
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error?.message || "Failed to create template")
      }

      setOpen(false)
      resetForm()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
          New Template
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Recurring Template</DialogTitle>
          <DialogDescription>
            Create a template for a recurring monthly expense
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
              {categories.length === 0 && (
                <FieldDescription>
                  No categories found. Create one in Settings.
                </FieldDescription>
              )}
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

            {/* Sample Invoice Upload - Coming Soon */}
            <div className="rounded-lg border border-dashed border-muted-foreground/25 bg-muted/30 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                  <FileImage className="size-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">Sample Invoice</p>
                    <Badge variant="secondary" className="text-[10px]">
                      Coming Soon
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload a sample invoice to auto-detect vendor and category
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Template"}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

// Common US state tax rates for reference
const US_STATE_TAX_RATES = [
  { state: "California", rate: 0.0725 },
  { state: "Texas", rate: 0.0625 },
  { state: "Florida", rate: 0.06 },
  { state: "New York", rate: 0.08 },
  { state: "Pennsylvania", rate: 0.06 },
  { state: "Illinois", rate: 0.0625 },
  { state: "Ohio", rate: 0.0575 },
  { state: "Georgia", rate: 0.04 },
  { state: "North Carolina", rate: 0.0475 },
  { state: "Michigan", rate: 0.06 },
]

interface OrgSettings {
  id: string
  name: string
  slug: string
  defaultTaxRate: number
}

interface OrganizationSettingsFormProps {
  initialSettings: OrgSettings
  orgId: string
}

export function OrganizationSettingsForm({
  initialSettings,
  orgId,
}: OrganizationSettingsFormProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: initialSettings.name,
    defaultTaxRate: (initialSettings.defaultTaxRate * 100).toFixed(2),
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    setError(null)
    setSuccess(false)
    setIsSaving(true)

    try {
      // Convert percentage to decimal
      const taxRateDecimal = parseFloat(formData.defaultTaxRate) / 100

      const response = await fetch(`/api/orgs/${orgId}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name !== initialSettings.name ? formData.name : undefined,
          defaultTaxRate: taxRateDecimal,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error?.message || "Failed to update settings")
      }

      setSuccess(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  function handleQuickTaxRate(rate: number) {
    setFormData((prev) => ({
      ...prev,
      defaultTaxRate: (rate * 100).toFixed(2),
    }))
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">General Settings</CardTitle>
          <CardDescription>
            Basic organization information and defaults
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            {error && (
              <FieldError className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                {error}
              </FieldError>
            )}

            {success && (
              <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-600">
                Settings saved successfully
              </div>
            )}

            <Field>
              <FieldLabel htmlFor="name">Organization Name</FieldLabel>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                disabled={isSaving}
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="defaultTaxRate">
                Default Tax Rate (%)
              </FieldLabel>
              <Input
                id="defaultTaxRate"
                type="number"
                step="0.01"
                min="0"
                max="50"
                placeholder="e.g., 8.25"
                value={formData.defaultTaxRate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    defaultTaxRate: e.target.value,
                  }))
                }
                disabled={isSaving}
              />
              <FieldDescription>
                This rate is used to auto-calculate tax on new expenses. Enter
                as a percentage (e.g., 8.25 for 8.25%).
              </FieldDescription>
            </Field>

            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-xs font-medium mb-2">Common US State Rates</p>
              <div className="flex flex-wrap gap-2">
                {US_STATE_TAX_RATES.map(({ state, rate }) => (
                  <Button
                    key={state}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-[10px]"
                    onClick={() => handleQuickTaxRate(rate)}
                    disabled={isSaving}
                  >
                    {state} ({(rate * 100).toFixed(2)}%)
                  </Button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                Note: These are base state rates. Local taxes may vary.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>
    </form>
  )
}

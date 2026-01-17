import { Suspense } from "react"
import { redirect } from "next/navigation"
import { connection } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { OrganizationSettingsForm } from "./_components/organization-settings-form"

function SettingsSkeleton() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

// Server component that fetches settings
async function SettingsContent() {
  // Mark as dynamic - auth requires request headers
  await connection()

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/auth/sign-in")
  }

  const orgId = session.session.activeOrganizationId
  if (!orgId) {
    redirect("/org/select")
  }

  // Fetch organization details
  const org = await auth.api.getFullOrganization({
    headers: await headers(),
    query: { organizationId: orgId },
  })

  if (!org) {
    redirect("/org/select")
  }

  // Parse metadata for defaultTaxRate
  const metadata = org.metadata as Record<string, unknown> | undefined
  const defaultTaxRate =
    metadata && typeof metadata.defaultTaxRate === "number"
      ? metadata.defaultTaxRate
      : 0

  const settings = {
    id: org.id,
    name: org.name,
    slug: org.slug,
    defaultTaxRate,
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Static header */}
      <div>
        <h1 className="text-lg font-medium">Organization Settings</h1>
        <p className="text-xs text-muted-foreground">
          Configure settings for your organization
        </p>
      </div>

      {/* Client form with initial data */}
      <OrganizationSettingsForm initialSettings={settings} orgId={orgId} />
    </div>
  )
}

// Page with Suspense boundary for streaming
export default function OrganizationSettingsPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsContent />
    </Suspense>
  )
}

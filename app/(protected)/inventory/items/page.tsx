import { Suspense } from "react"
import { redirect } from "next/navigation"
import { connection } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { ItemList, ItemListSkeleton } from "./_components/item-list"
import { ItemSearch } from "./_components/item-search"
import { NewItemDialog } from "./_components/new-item-dialog"

// Server component that fetches data - wrapped in Suspense
async function ItemListWithAuth({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>
}) {
  // Mark as dynamic - auth requires request headers
  await connection()

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/auth/sign-in")
  }

  if (!session.session.activeOrganizationId) {
    redirect("/org/select")
  }

  const params = await searchParams
  const orgId = session.session.activeOrganizationId

  return (
    <ItemList
      orgId={orgId}
      search={params.search}
      page={params.page ? parseInt(params.page, 10) : 1}
    />
  )
}

// Page renders static UI immediately, only data fetching is in Suspense
export default function InventoryItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>
}) {
  return (
    <div className="space-y-6">
      {/* Static header - renders immediately */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium">Inventory Items</h1>
          <p className="text-xs text-muted-foreground">
            Manage your inventory and track price history
          </p>
        </div>
        {/* Client component using client-side auth state */}
        <NewItemDialog />
      </div>

      {/* Client component using useSearchParams - needs Suspense */}
      <Suspense fallback={<div className="h-9" />}>
        <ItemSearch />
      </Suspense>

      {/* Only the data list is in Suspense */}
      <Suspense fallback={<ItemListSkeleton />}>
        <ItemListWithAuth searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

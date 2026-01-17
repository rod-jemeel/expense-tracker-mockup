import { Suspense } from "react"
import Link from "next/link"
import { redirect, notFound } from "next/navigation"
import { connection } from "next/server"
import { headers } from "next/headers"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, DeliveryBox01Icon } from "@hugeicons/core-free-icons"
import { auth } from "@/lib/auth"
import { getItem } from "@/lib/server/services/inventory"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CurrentPrice, CurrentPriceSkeleton } from "./_components/current-price"
import { PriceHistory, PriceHistorySkeleton } from "./_components/price-history"
import { AddPriceDialog } from "./_components/add-price-dialog"

function ItemDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="size-8" />
        <Skeleton className="size-10 rounded-lg" />
        <div className="flex-1">
          <Skeleton className="h-5 w-32 mb-1" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <CurrentPriceSkeleton />
      </div>
      <div>
        <Skeleton className="h-4 w-24 mb-4" />
        <PriceHistorySkeleton />
      </div>
    </div>
  )
}

async function ItemDetailContent({
  params,
}: {
  params: Promise<{ id: string }>
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

  const { id: itemId } = await params
  const orgId = session.session.activeOrganizationId

  let item
  try {
    item = await getItem({ itemId, orgId })
  } catch {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/inventory/items">
            <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
          </Link>
        </Button>
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
          <HugeiconsIcon icon={DeliveryBox01Icon} strokeWidth={2} className="size-5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-medium">{item.name}</h1>
            {!item.is_active && (
              <Badge variant="secondary" className="text-[10px]">
                Inactive
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {item.sku && <span>SKU: {item.sku}</span>}
            <span>Unit: {item.unit}</span>
          </div>
        </div>
        <AddPriceDialog itemId={itemId} unit={item.unit} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <CurrentPrice itemId={itemId} orgId={orgId} unit={item.unit} />
      </div>

      <div>
        <h2 className="mb-4 text-sm font-medium">Price History</h2>
        <PriceHistory itemId={itemId} orgId={orgId} unit={item.unit} />
      </div>
    </div>
  )
}

export default function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <Suspense fallback={<ItemDetailSkeleton />}>
      <ItemDetailContent params={params} />
    </Suspense>
  )
}

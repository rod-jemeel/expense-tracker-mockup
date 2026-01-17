import { Suspense } from "react"
import { redirect } from "next/navigation"
import { connection } from "next/server"
import { headers } from "next/headers"
import { HugeiconsIcon } from "@hugeicons/react"
import { Tag01Icon } from "@hugeicons/core-free-icons"
import { auth } from "@/lib/auth"
import { CategoryList, CategoryListSkeleton } from "./_components/category-list"
import { NewCategoryDialog } from "./_components/new-category-dialog"

// Server component that fetches data - wrapped in Suspense
async function CategoryListWithAuth() {
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

  const orgId = session.session.activeOrganizationId

  return <CategoryList orgId={orgId} />
}

// Page renders static UI immediately, only data fetching is in Suspense
export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      {/* Static header - renders immediately */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <HugeiconsIcon icon={Tag01Icon} strokeWidth={2} className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-medium">Expense Categories</h1>
            <p className="text-xs text-muted-foreground">
              Manage categories for organizing expenses
            </p>
          </div>
        </div>
        {/* Client component using client-side auth state */}
        <NewCategoryDialog />
      </div>

      {/* Only the data list is in Suspense */}
      <Suspense fallback={<CategoryListSkeleton />}>
        <CategoryListWithAuth />
      </Suspense>
    </div>
  )
}

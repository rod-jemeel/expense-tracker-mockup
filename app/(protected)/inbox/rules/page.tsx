import { Suspense } from "react"
import { redirect } from "next/navigation"
import { connection } from "next/server"
import { headers } from "next/headers"
import { Share2 } from "lucide-react"
import { auth } from "@/lib/auth"
import { RulesContent, RulesContentSkeleton } from "./_components/rules-content"

async function RulesContentWithAuth() {
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

  return <RulesContent orgId={orgId} />
}

export default function ForwardingRulesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <Share2 className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-medium">Forwarding Rules</h1>
            <p className="text-xs text-muted-foreground">
              Automatically notify team members about important emails
            </p>
          </div>
        </div>
      </div>

      <Suspense fallback={<RulesContentSkeleton />}>
        <RulesContentWithAuth />
      </Suspense>
    </div>
  )
}

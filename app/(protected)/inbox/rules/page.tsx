import { Suspense } from "react"
import { redirect } from "next/navigation"
import { connection } from "next/server"
import { headers } from "next/headers"
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
    <Suspense fallback={<RulesContentSkeleton />}>
      <RulesContentWithAuth />
    </Suspense>
  )
}

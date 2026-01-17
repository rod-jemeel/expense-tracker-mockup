import { redirect } from "next/navigation"
import { connection } from "next/server"
import { headers } from "next/headers"
import { Suspense } from "react"
import { auth } from "@/lib/auth"
import { isSuperadmin } from "@/lib/server/auth-helpers"

// Auth check component that runs inside Suspense
async function SuperadminGate({ children }: { children: React.ReactNode }) {
  // Mark as dynamic - auth requires request headers
  await connection()

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/auth/sign-in")
  }

  // Only superadmins can access /super routes
  if (!isSuperadmin(session)) {
    redirect("/dashboard")
  }

  return <>{children}</>
}

export default function SuperLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={null}>
      <SuperadminGate>{children}</SuperadminGate>
    </Suspense>
  )
}

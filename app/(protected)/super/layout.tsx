import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { isSuperadmin } from "@/lib/server/auth-helpers"

export default async function SuperLayout({
  children,
}: {
  children: React.ReactNode
}) {
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

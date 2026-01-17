import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  // Redirect to dashboard if authenticated, otherwise to sign-in
  if (session) {
    redirect("/dashboard")
  } else {
    redirect("/auth/sign-in")
  }
}
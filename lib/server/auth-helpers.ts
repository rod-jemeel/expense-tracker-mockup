import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

/**
 * Get session or redirect to login
 */
export async function getSessionOrThrow() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  return session
}

/**
 * Get active organization or redirect to org select
 */
export async function getActiveOrgOrThrow() {
  const session = await getSessionOrThrow()

  if (!session.session.activeOrganizationId) {
    redirect("/org/select")
  }

  const org = await auth.api.getFullOrganization({
    headers: await headers(),
    query: {
      organizationId: session.session.activeOrganizationId,
    },
  })

  if (!org) {
    redirect("/org/select")
  }

  return { session, org }
}

/**
 * Require specific role(s) to access a resource
 * @param requiredRoles - Array of role names (user needs at least one)
 */
export async function requireRole(requiredRoles: string[]) {
  const { session, org } = await getActiveOrgOrThrow()

  // Find user's membership in this org
  const membership = org.members.find(
    (m) => m.userId === session.user.id
  )

  if (!membership) {
    throw new Error("Not a member of this organization")
  }

  // Check if user has any of the required roles
  const userRoles = membership.role.split(",")
  const hasRole = requiredRoles.some((role) => userRoles.includes(role))

  if (!hasRole) {
    throw new Error(`Role required: ${requiredRoles.join(" or ")}`)
  }

  return { session, org, membership }
}

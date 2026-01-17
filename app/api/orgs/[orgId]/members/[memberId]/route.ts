import { NextRequest } from "next/server"
import { connection, after } from "next/server"
import { headers } from "next/headers"
import { requireOrgAccess } from "@/lib/server/auth-helpers"
import { handleError, ApiError } from "@/lib/errors"
import { auth } from "@/lib/auth"

type RouteContext = {
  params: Promise<{ orgId: string; memberId: string }>
}

/**
 * DELETE /api/orgs/:orgId/members/:memberId
 * Remove a member from the organization
 * Roles: org_admin
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  // Mark route as dynamic - auth requires request headers
  await connection()

  try {
    const { orgId, memberId } = await context.params
    const { session, org } = await requireOrgAccess(orgId, ["org_admin"])

    // Can't remove yourself
    const currentMember = org.members.find(
      (m: { userId: string }) => m.userId === session.user.id
    )
    if (currentMember && currentMember.id === memberId) {
      throw new ApiError("FORBIDDEN", "You cannot remove yourself from the organization")
    }

    // Can't remove org_admin members (only superadmins should be able to)
    const targetMember = org.members.find(
      (m: { id: string }) => m.id === memberId
    )
    if (targetMember && targetMember.role === "org_admin") {
      throw new ApiError(
        "FORBIDDEN",
        "Cannot remove organization administrators. Contact a superadmin."
      )
    }

    // Remove member using Better Auth API
    await auth.api.removeMember({
      headers: await headers(),
      body: {
        memberIdOrEmail: memberId,
        organizationId: orgId,
      },
    })

    // Log removal (non-blocking)
    after(async () => {
      console.log(
        `[AUDIT] User ${session.user.email} removed member ${memberId} from org ${orgId}`
      )
    })

    return Response.json({ data: { removed: true } })
  } catch (error) {
    return handleError(error)
  }
}

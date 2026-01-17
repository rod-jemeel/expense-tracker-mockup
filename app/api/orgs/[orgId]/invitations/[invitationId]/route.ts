import { NextRequest } from "next/server"
import { connection, after } from "next/server"
import { headers } from "next/headers"
import { requireOrgAccess } from "@/lib/server/auth-helpers"
import { handleError } from "@/lib/errors"
import { auth } from "@/lib/auth"

type RouteContext = {
  params: Promise<{ orgId: string; invitationId: string }>
}

/**
 * DELETE /api/orgs/:orgId/invitations/:invitationId
 * Cancel a pending invitation
 * Roles: org_admin
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  // Mark route as dynamic - auth requires request headers
  await connection()

  try {
    const { orgId, invitationId } = await context.params
    const { session } = await requireOrgAccess(orgId, ["org_admin"])

    // Cancel invitation using Better Auth API
    await auth.api.cancelInvitation({
      headers: await headers(),
      body: {
        invitationId,
      },
    })

    // Log cancellation (non-blocking)
    after(async () => {
      console.log(
        `[AUDIT] User ${session.user.email} cancelled invitation ${invitationId} in org ${orgId}`
      )
    })

    return Response.json({ data: { cancelled: true } })
  } catch (error) {
    return handleError(error)
  }
}

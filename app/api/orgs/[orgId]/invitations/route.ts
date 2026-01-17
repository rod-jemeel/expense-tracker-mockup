import { NextRequest } from "next/server"
import { connection, after } from "next/server"
import { headers } from "next/headers"
import { requireOrgAccess } from "@/lib/server/auth-helpers"
import { handleError, validationError, ApiError } from "@/lib/errors"
import { inviteMemberSchema } from "@/lib/validations/invitation"
import { auth } from "@/lib/auth"

type RouteContext = { params: Promise<{ orgId: string }> }

/**
 * GET /api/orgs/:orgId/invitations
 * List pending invitations for the organization
 * Roles: org_admin
 */
export async function GET(request: NextRequest, context: RouteContext) {
  // Mark route as dynamic - auth requires request headers
  await connection()

  try {
    const { orgId } = await context.params
    const { session } = await requireOrgAccess(orgId, ["org_admin"])

    // Get invitations using Better Auth API
    const invitations = await auth.api.listInvitations({
      headers: await headers(),
      query: { organizationId: orgId },
    })

    // Filter to only pending invitations
    const pendingInvitations = (invitations || []).filter(
      (inv: { status: string }) => inv.status === "pending"
    )

    return Response.json({ data: pendingInvitations })
  } catch (error) {
    return handleError(error)
  }
}

/**
 * POST /api/orgs/:orgId/invitations
 * Invite a new member to the organization
 * Roles: org_admin
 * Note: org_admin can only invite finance, inventory, viewer roles
 */
export async function POST(request: NextRequest, context: RouteContext) {
  // Mark route as dynamic - auth requires request headers
  await connection()

  try {
    const { orgId } = await context.params
    const { session } = await requireOrgAccess(orgId, ["org_admin"])

    const body = await request.json()
    const result = inviteMemberSchema.safeParse(body)

    if (!result.success) {
      return validationError(result.error.issues).toResponse()
    }

    const { email, role } = result.data

    // Note: The schema already restricts roles to finance, inventory, viewer
    // Only superadmins can invite org_admin (through the superadmin API)

    // Create invitation using Better Auth API
    const invitation = await auth.api.createInvitation({
      headers: await headers(),
      body: {
        email,
        role,
        organizationId: orgId,
      },
    })

    // Log invitation (non-blocking)
    after(async () => {
      console.log(
        `[AUDIT] User ${session.user.email} invited ${email} as ${role} to org ${orgId}`
      )
    })

    return Response.json({ data: invitation }, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}

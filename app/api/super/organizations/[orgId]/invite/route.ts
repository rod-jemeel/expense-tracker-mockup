import { NextRequest } from "next/server"
import { connection, after } from "next/server"
import { headers } from "next/headers"
import { requireSuperadmin } from "@/lib/server/auth-helpers"
import { handleError, validationError } from "@/lib/errors"
import { inviteOrgAdminSchema } from "@/lib/validations/invitation"
import { superInviteMemberSchema } from "@/lib/validations/organization"
import { auth } from "@/lib/auth"

type RouteContext = { params: Promise<{ orgId: string }> }

/**
 * POST /api/super/organizations/:orgId/invite
 * Invite an org_admin to an organization (superadmin only)
 */
export async function POST(request: NextRequest, context: RouteContext) {
  // Mark route as dynamic - auth requires request headers
  await connection()

  try {
    const session = await requireSuperadmin()
    const { orgId } = await context.params

    const body = await request.json()

    // Support role param from body; fall back to org_admin for backwards compatibility
    const memberResult = superInviteMemberSchema.safeParse(body)
    const legacyResult = inviteOrgAdminSchema.safeParse({
      ...body,
      organizationId: orgId,
    })

    // Try the new schema first (with role), then fall back to legacy (without role)
    const email = memberResult.success
      ? memberResult.data.email
      : legacyResult.success
        ? legacyResult.data.email
        : null
    const role = memberResult.success ? memberResult.data.role : "org_admin"

    if (!email) {
      const errors = memberResult.success
        ? []
        : (legacyResult.error?.issues || [])
      return validationError(errors).toResponse()
    }

    const organizationId = orgId

    // Create invitation using Better Auth API
    const invitation = await auth.api.createInvitation({
      headers: await headers(),
      body: {
        email,
        role,
        organizationId,
      },
    })

    // Log invitation (non-blocking)
    after(async () => {
      console.log(
        `[AUDIT] Superadmin ${session.user.email} invited ${email} as ${role} to org ${organizationId}`
      )
    })

    return Response.json({ data: invitation }, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}

import { NextRequest } from "next/server"
import { connection } from "next/server"
import { headers } from "next/headers"
import { requireOrgAccess } from "@/lib/server/auth-helpers"
import { handleError } from "@/lib/errors"
import { auth } from "@/lib/auth"

type RouteContext = { params: Promise<{ orgId: string }> }

/**
 * GET /api/orgs/:orgId/members
 * List all members of the organization
 * Roles: org_admin
 */
export async function GET(request: NextRequest, context: RouteContext) {
  // Mark route as dynamic - auth requires request headers
  await connection()

  try {
    const { orgId } = await context.params
    await requireOrgAccess(orgId, ["org_admin"])

    // Get members using Better Auth API
    const result = await auth.api.listMembers({
      headers: await headers(),
      query: { organizationId: orgId },
    })

    return Response.json({ data: result.members || [] })
  } catch (error) {
    return handleError(error)
  }
}

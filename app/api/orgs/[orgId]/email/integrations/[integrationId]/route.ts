import { NextRequest } from "next/server"
import { requireOrgAccess } from "@/lib/server/auth-helpers"
import { ApiError } from "@/lib/errors"
import {
  getEmailIntegration,
  disconnectEmailAccount,
} from "@/lib/server/services/email-integrations"

type RouteContext = { params: Promise<{ orgId: string; integrationId: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { orgId, integrationId } = await context.params
    const { org } = await requireOrgAccess(orgId)

    const integration = await getEmailIntegration({ integrationId, orgId: org.id })
    return Response.json({ data: integration })
  } catch (error) {
    if (error instanceof ApiError) return error.toResponse()
    console.error("Get email integration error:", error)
    return new ApiError("INTERNAL_ERROR", "Failed to get email integration").toResponse()
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { orgId, integrationId } = await context.params
    const { org } = await requireOrgAccess(orgId, ["org_admin"])

    await disconnectEmailAccount({ integrationId, orgId: org.id })
    return new Response(null, { status: 204 })
  } catch (error) {
    if (error instanceof ApiError) return error.toResponse()
    console.error("Disconnect email account error:", error)
    return new ApiError("INTERNAL_ERROR", "Failed to disconnect email account").toResponse()
  }
}

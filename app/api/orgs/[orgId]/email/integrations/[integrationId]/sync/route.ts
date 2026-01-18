import { NextRequest } from "next/server"
import { requireOrgAccess } from "@/lib/server/auth-helpers"
import { ApiError } from "@/lib/errors"
import { syncEmailAccount } from "@/lib/server/services/email-integrations"

type RouteContext = { params: Promise<{ orgId: string; integrationId: string }> }

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { orgId, integrationId } = await context.params
    const { org } = await requireOrgAccess(orgId, ["org_admin", "finance"])

    const result = await syncEmailAccount({ integrationId, orgId: org.id })
    return Response.json({ data: result })
  } catch (error) {
    if (error instanceof ApiError) return error.toResponse()
    console.error("Sync email account error:", error)
    return new ApiError("INTERNAL_ERROR", "Failed to sync email account").toResponse()
  }
}

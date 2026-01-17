import { NextRequest } from "next/server"
import { requireOrgAccess } from "@/lib/server/auth-helpers"
import { handleError } from "@/lib/errors"
import { getDownloadUrl } from "@/lib/server/services/attachments"

type RouteContext = {
  params: Promise<{ orgId: string; attachmentId: string }>
}

/**
 * GET /api/orgs/:orgId/attachments/:attachmentId/download
 * Get a signed download URL for an attachment
 * Roles: any member
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { orgId, attachmentId } = await context.params
    const { org } = await requireOrgAccess(orgId)

    const data = await getDownloadUrl({
      attachmentId,
      orgId: org.id,
    })

    return Response.json({ data })
  } catch (error) {
    return handleError(error)
  }
}

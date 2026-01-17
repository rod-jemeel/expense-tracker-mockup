import { NextRequest } from "next/server"
import { requireOrgAccess } from "@/lib/server/auth-helpers"
import { handleError, validationError } from "@/lib/errors"
import { createUploadUrlSchema } from "@/lib/validations/attachment"
import { createUploadUrl } from "@/lib/server/services/attachments"

type RouteContext = { params: Promise<{ orgId: string }> }

/**
 * POST /api/orgs/:orgId/attachments/upload-url
 * Create a signed upload URL for a new attachment
 * Roles: org_admin, finance, inventory
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { orgId } = await context.params
    const { session, org } = await requireOrgAccess(orgId, [
      "org_admin",
      "finance",
      "inventory",
    ])

    const body = await request.json()
    const result = createUploadUrlSchema.safeParse(body)

    if (!result.success) {
      return validationError(result.error.issues).toResponse()
    }

    const data = await createUploadUrl({
      input: result.data,
      orgId: org.id,
      userId: session.user.id,
    })

    return Response.json({ data }, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}

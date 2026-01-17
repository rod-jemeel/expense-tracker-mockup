import { NextRequest } from "next/server"
import { requireOrgAccess } from "@/lib/server/auth-helpers"
import { handleError, validationError } from "@/lib/errors"
import {
  createRecurringTemplateSchema,
  listRecurringTemplatesSchema,
} from "@/lib/validations/recurring-template"
import { parseSearchParams } from "@/lib/validations/common"
import {
  createRecurringTemplate,
  listRecurringTemplates,
} from "@/lib/server/services/recurring-templates"

type RouteContext = { params: Promise<{ orgId: string }> }

/**
 * POST /api/orgs/:orgId/recurring-templates
 * Create a new recurring expense template
 * Roles: org_admin, finance
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { orgId } = await context.params
    const { session, org } = await requireOrgAccess(orgId, [
      "org_admin",
      "finance",
    ])

    const body = await request.json()
    const result = createRecurringTemplateSchema.safeParse(body)

    if (!result.success) {
      return validationError(result.error.issues).toResponse()
    }

    const template = await createRecurringTemplate({
      input: result.data,
      orgId: org.id,
      userId: session.user.id,
    })

    return Response.json({ data: template }, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}

/**
 * GET /api/orgs/:orgId/recurring-templates
 * List recurring expense templates with optional filtering
 * Roles: any member
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { orgId } = await context.params
    const { org } = await requireOrgAccess(orgId)

    const params = parseSearchParams(new URL(request.url))
    const result = listRecurringTemplatesSchema.safeParse(params)

    if (!result.success) {
      return validationError(result.error.issues).toResponse()
    }

    const data = await listRecurringTemplates({
      query: result.data,
      orgId: org.id,
    })

    return Response.json({ data })
  } catch (error) {
    return handleError(error)
  }
}

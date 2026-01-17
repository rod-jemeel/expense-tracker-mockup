import { NextRequest } from "next/server"
import { requireOrgAccess } from "@/lib/server/auth-helpers"
import { handleError, validationError } from "@/lib/errors"
import { updateRecurringTemplateSchema } from "@/lib/validations/recurring-template"
import {
  getRecurringTemplate,
  updateRecurringTemplate,
  deleteRecurringTemplate,
  getTemplateExpenseHistory,
} from "@/lib/server/services/recurring-templates"

type RouteContext = { params: Promise<{ orgId: string; templateId: string }> }

/**
 * GET /api/orgs/:orgId/recurring-templates/:templateId
 * Get a single recurring template with expense history
 * Roles: any member
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { orgId, templateId } = await context.params
    const { org } = await requireOrgAccess(orgId)

    // Fetch template and expense history in parallel (async-parallel pattern)
    const [template, expenseHistory] = await Promise.all([
      getRecurringTemplate({
        templateId,
        orgId: org.id,
      }),
      getTemplateExpenseHistory({
        templateId,
        orgId: org.id,
      }),
    ])

    return Response.json({
      data: {
        ...template,
        expenseHistory,
      },
    })
  } catch (error) {
    return handleError(error)
  }
}

/**
 * PATCH /api/orgs/:orgId/recurring-templates/:templateId
 * Update a recurring template
 * Roles: org_admin, finance
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { orgId, templateId } = await context.params
    const { org } = await requireOrgAccess(orgId, ["org_admin", "finance"])

    const body = await request.json()
    const result = updateRecurringTemplateSchema.safeParse(body)

    if (!result.success) {
      return validationError(result.error.issues).toResponse()
    }

    const template = await updateRecurringTemplate({
      templateId,
      orgId: org.id,
      input: result.data,
    })

    return Response.json({ data: template })
  } catch (error) {
    return handleError(error)
  }
}

/**
 * DELETE /api/orgs/:orgId/recurring-templates/:templateId
 * Deactivate a recurring template (soft delete)
 * Roles: org_admin, finance
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { orgId, templateId } = await context.params
    const { org } = await requireOrgAccess(orgId, ["org_admin", "finance"])

    await deleteRecurringTemplate({
      templateId,
      orgId: org.id,
    })

    return Response.json({ data: { deleted: true } })
  } catch (error) {
    return handleError(error)
  }
}

import { NextRequest } from "next/server"
import { requireOrgAccess } from "@/lib/server/auth-helpers"
import { ApiError, validationError } from "@/lib/errors"
import { updateForwardingRuleSchema } from "@/lib/validations/email"
import {
  getForwardingRule,
  updateForwardingRule,
  deleteForwardingRule,
} from "@/lib/server/services/forwarding-rules"

type RouteContext = { params: Promise<{ orgId: string; ruleId: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { orgId, ruleId } = await context.params
    const { org } = await requireOrgAccess(orgId)

    const rule = await getForwardingRule({ ruleId, orgId: org.id })
    return Response.json({ data: rule })
  } catch (error) {
    if (error instanceof ApiError) return error.toResponse()
    console.error("Get forwarding rule error:", error)
    return new ApiError("INTERNAL_ERROR", "Failed to get forwarding rule").toResponse()
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { orgId, ruleId } = await context.params
    const { org } = await requireOrgAccess(orgId, ["org_admin"])

    const body = await request.json()
    const result = updateForwardingRuleSchema.safeParse(body)

    if (!result.success) {
      return validationError(result.error.issues).toResponse()
    }

    const rule = await updateForwardingRule({
      ruleId,
      orgId: org.id,
      data: result.data,
    })
    return Response.json({ data: rule })
  } catch (error) {
    if (error instanceof ApiError) return error.toResponse()
    console.error("Update forwarding rule error:", error)
    return new ApiError("INTERNAL_ERROR", "Failed to update forwarding rule").toResponse()
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { orgId, ruleId } = await context.params
    const { org } = await requireOrgAccess(orgId, ["org_admin"])

    await deleteForwardingRule({ ruleId, orgId: org.id })
    return new Response(null, { status: 204 })
  } catch (error) {
    if (error instanceof ApiError) return error.toResponse()
    console.error("Delete forwarding rule error:", error)
    return new ApiError("INTERNAL_ERROR", "Failed to delete forwarding rule").toResponse()
  }
}

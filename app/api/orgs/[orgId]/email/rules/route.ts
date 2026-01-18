import { NextRequest } from "next/server"
import { requireOrgAccess } from "@/lib/server/auth-helpers"
import { ApiError, validationError } from "@/lib/errors"
import {
  createForwardingRuleSchema,
  listForwardingRulesSchema,
} from "@/lib/validations/email"
import {
  listForwardingRules,
  createForwardingRule,
} from "@/lib/server/services/forwarding-rules"

type RouteContext = { params: Promise<{ orgId: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { orgId } = await context.params
    const { org } = await requireOrgAccess(orgId)

    const searchParams = request.nextUrl.searchParams
    const query = listForwardingRulesSchema.safeParse({
      includeInactive: searchParams.get("includeInactive"),
    })

    if (!query.success) {
      return validationError(query.error.issues).toResponse()
    }

    const data = await listForwardingRules({ orgId: org.id, query: query.data })
    return Response.json({ data })
  } catch (error) {
    if (error instanceof ApiError) return error.toResponse()
    console.error("List forwarding rules error:", error)
    return new ApiError("INTERNAL_ERROR", "Failed to list forwarding rules").toResponse()
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { orgId } = await context.params
    const { org, session } = await requireOrgAccess(orgId, ["org_admin"])

    const body = await request.json()
    const result = createForwardingRuleSchema.safeParse(body)

    if (!result.success) {
      return validationError(result.error.issues).toResponse()
    }

    const rule = await createForwardingRule({
      orgId: org.id,
      userId: session.user.id,
      data: result.data,
    })
    return Response.json({ data: rule }, { status: 201 })
  } catch (error) {
    if (error instanceof ApiError) return error.toResponse()
    console.error("Create forwarding rule error:", error)
    return new ApiError("INTERNAL_ERROR", "Failed to create forwarding rule").toResponse()
  }
}

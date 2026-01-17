import { NextRequest } from "next/server"
import { z } from "zod"
import { requireOrgAccess } from "@/lib/server/auth-helpers"
import { handleError, validationError } from "@/lib/errors"
import { parseSearchParams, monthSchema } from "@/lib/validations/common"
import { getDashboard } from "@/lib/server/services/dashboard"

type RouteContext = { params: Promise<{ orgId: string }> }

const dashboardQuerySchema = z.object({
  month: monthSchema,
  compare: z.enum(["prev", "none"]).default("prev"),
})

/**
 * GET /api/orgs/:orgId/dashboard?month=YYYY-MM&compare=prev
 * Get dashboard data for a specific month
 * Roles: any member
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { orgId } = await context.params
    const { org } = await requireOrgAccess(orgId)

    const params = parseSearchParams(new URL(request.url))
    const result = dashboardQuerySchema.safeParse(params)

    if (!result.success) {
      return validationError(result.error.issues).toResponse()
    }

    const data = await getDashboard({
      month: result.data.month,
      compare: result.data.compare,
      orgId: org.id,
    })

    return Response.json({ data })
  } catch (error) {
    return handleError(error)
  }
}

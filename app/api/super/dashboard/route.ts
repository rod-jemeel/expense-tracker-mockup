import { NextRequest } from "next/server"
import { connection } from "next/server"
import { z } from "zod"
import { requireSuperadmin } from "@/lib/server/auth-helpers"
import { handleError, validationError } from "@/lib/errors"
import { parseSearchParams, monthSchema } from "@/lib/validations/common"
import { getSuperDashboard } from "@/lib/server/services/super-dashboard"

const superDashboardQuerySchema = z.object({
  month: monthSchema,
})

/**
 * GET /api/super/dashboard?month=YYYY-MM
 * Get aggregated dashboard data across all organizations (superadmin only)
 */
export async function GET(request: NextRequest) {
  // Mark route as dynamic - auth requires request headers
  await connection()

  try {
    await requireSuperadmin()

    const params = parseSearchParams(new URL(request.url))
    const result = superDashboardQuerySchema.safeParse(params)

    if (!result.success) {
      return validationError(result.error.issues).toResponse()
    }

    const data = await getSuperDashboard({
      month: result.data.month,
    })

    return Response.json({ data })
  } catch (error) {
    return handleError(error)
  }
}

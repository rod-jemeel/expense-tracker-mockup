import { NextRequest } from "next/server"
import { requireOrgAccess } from "@/lib/server/auth-helpers"
import { ApiError, validationError } from "@/lib/errors"
import { listDetectedEmailsSchema } from "@/lib/validations/email"
import { listDetectedEmails } from "@/lib/server/services/detected-emails"

type RouteContext = { params: Promise<{ orgId: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { orgId } = await context.params
    const { org } = await requireOrgAccess(orgId)

    const searchParams = request.nextUrl.searchParams
    const query = listDetectedEmailsSchema.safeParse({
      categoryId: searchParams.get("categoryId"),
      isRead: searchParams.get("isRead"),
      isArchived: searchParams.get("isArchived"),
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    })

    if (!query.success) {
      return validationError(query.error.issues).toResponse()
    }

    const data = await listDetectedEmails({ orgId: org.id, query: query.data })
    return Response.json({ data })
  } catch (error) {
    if (error instanceof ApiError) return error.toResponse()
    console.error("List detected emails error:", error)
    return new ApiError("INTERNAL_ERROR", "Failed to list detected emails").toResponse()
  }
}

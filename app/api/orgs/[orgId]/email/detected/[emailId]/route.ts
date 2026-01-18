import { NextRequest } from "next/server"
import { requireOrgAccess } from "@/lib/server/auth-helpers"
import { ApiError, validationError } from "@/lib/errors"
import { updateDetectedEmailSchema } from "@/lib/validations/email"
import {
  getDetectedEmail,
  updateDetectedEmail,
} from "@/lib/server/services/detected-emails"

type RouteContext = { params: Promise<{ orgId: string; emailId: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { orgId, emailId } = await context.params
    const { org } = await requireOrgAccess(orgId)

    const email = await getDetectedEmail({ emailId, orgId: org.id })
    return Response.json({ data: email })
  } catch (error) {
    if (error instanceof ApiError) return error.toResponse()
    console.error("Get detected email error:", error)
    return new ApiError("INTERNAL_ERROR", "Failed to get detected email").toResponse()
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { orgId, emailId } = await context.params
    const { org } = await requireOrgAccess(orgId)

    const body = await request.json()
    const result = updateDetectedEmailSchema.safeParse(body)

    if (!result.success) {
      return validationError(result.error.issues).toResponse()
    }

    const email = await updateDetectedEmail({
      emailId,
      orgId: org.id,
      data: result.data,
    })
    return Response.json({ data: email })
  } catch (error) {
    if (error instanceof ApiError) return error.toResponse()
    console.error("Update detected email error:", error)
    return new ApiError("INTERNAL_ERROR", "Failed to update detected email").toResponse()
  }
}

import { NextRequest } from "next/server"
import { requireOrgAccess } from "@/lib/server/auth-helpers"
import { ApiError, validationError } from "@/lib/errors"
import { updateEmailCategorySchema } from "@/lib/validations/email"
import {
  getEmailCategory,
  updateEmailCategory,
  deleteEmailCategory,
} from "@/lib/server/services/email-categories"

type RouteContext = { params: Promise<{ orgId: string; categoryId: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { orgId, categoryId } = await context.params
    const { org } = await requireOrgAccess(orgId)

    const category = await getEmailCategory({ categoryId, orgId: org.id })
    return Response.json({ data: category })
  } catch (error) {
    if (error instanceof ApiError) return error.toResponse()
    console.error("Get email category error:", error)
    return new ApiError("INTERNAL_ERROR", "Failed to get email category").toResponse()
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { orgId, categoryId } = await context.params
    const { org } = await requireOrgAccess(orgId, ["org_admin", "finance"])

    const body = await request.json()
    const result = updateEmailCategorySchema.safeParse(body)

    if (!result.success) {
      return validationError(result.error.issues).toResponse()
    }

    const category = await updateEmailCategory({
      categoryId,
      orgId: org.id,
      data: result.data,
    })
    return Response.json({ data: category })
  } catch (error) {
    if (error instanceof ApiError) return error.toResponse()
    console.error("Update email category error:", error)
    return new ApiError("INTERNAL_ERROR", "Failed to update email category").toResponse()
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { orgId, categoryId } = await context.params
    const { org } = await requireOrgAccess(orgId, ["org_admin"])

    await deleteEmailCategory({ categoryId, orgId: org.id })
    return new Response(null, { status: 204 })
  } catch (error) {
    if (error instanceof ApiError) return error.toResponse()
    console.error("Delete email category error:", error)
    return new ApiError("INTERNAL_ERROR", "Failed to delete email category").toResponse()
  }
}

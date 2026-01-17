import { NextRequest } from "next/server"
import { requireOrgAccess } from "@/lib/server/auth-helpers"
import { ApiError, validationError } from "@/lib/errors"
import { updateCategorySchema } from "@/lib/validations/category"
import {
  getCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/server/services/categories"

type RouteContext = { params: Promise<{ orgId: string; categoryId: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { orgId, categoryId } = await context.params
    const { org } = await requireOrgAccess(orgId)

    const category = await getCategory({ categoryId, orgId: org.id })
    return Response.json({ data: category })
  } catch (error) {
    if (error instanceof ApiError) return error.toResponse()
    console.error("Get category error:", error)
    return new ApiError("INTERNAL_ERROR", "Failed to get category").toResponse()
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { orgId, categoryId } = await context.params
    const { org } = await requireOrgAccess(orgId, ["org_admin", "finance"])

    const body = await request.json()
    const result = updateCategorySchema.safeParse(body)

    if (!result.success) {
      return validationError(result.error.issues).toResponse()
    }

    const category = await updateCategory({
      categoryId,
      orgId: org.id,
      data: result.data,
    })
    return Response.json({ data: category })
  } catch (error) {
    if (error instanceof ApiError) return error.toResponse()
    console.error("Update category error:", error)
    return new ApiError("INTERNAL_ERROR", "Failed to update category").toResponse()
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { orgId, categoryId } = await context.params
    const { org } = await requireOrgAccess(orgId, ["org_admin"])

    await deleteCategory({ categoryId, orgId: org.id })
    return new Response(null, { status: 204 })
  } catch (error) {
    if (error instanceof ApiError) return error.toResponse()
    console.error("Delete category error:", error)
    return new ApiError("INTERNAL_ERROR", "Failed to delete category").toResponse()
  }
}

import { NextRequest } from "next/server"
import { requireOrgAccess } from "@/lib/server/auth-helpers"
import { ApiError, validationError } from "@/lib/errors"
import {
  createCategorySchema,
  listCategoriesSchema,
} from "@/lib/validations/category"
import { listCategories, createCategory } from "@/lib/server/services/categories"

type RouteContext = { params: Promise<{ orgId: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { orgId } = await context.params
    const { org } = await requireOrgAccess(orgId)

    const searchParams = request.nextUrl.searchParams
    const query = listCategoriesSchema.safeParse({
      includeInactive: searchParams.get("includeInactive"),
    })

    if (!query.success) {
      return validationError(query.error.issues).toResponse()
    }

    const data = await listCategories({ orgId: org.id, query: query.data })
    return Response.json({ data })
  } catch (error) {
    if (error instanceof ApiError) return error.toResponse()
    console.error("List categories error:", error)
    return new ApiError("INTERNAL_ERROR", "Failed to list categories").toResponse()
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { orgId } = await context.params
    const { org } = await requireOrgAccess(orgId, ["org_admin", "finance"])

    const body = await request.json()
    const result = createCategorySchema.safeParse(body)

    if (!result.success) {
      return validationError(result.error.issues).toResponse()
    }

    const category = await createCategory({ orgId: org.id, data: result.data })
    return Response.json({ data: category }, { status: 201 })
  } catch (error) {
    if (error instanceof ApiError) return error.toResponse()
    console.error("Create category error:", error)
    return new ApiError("INTERNAL_ERROR", "Failed to create category").toResponse()
  }
}

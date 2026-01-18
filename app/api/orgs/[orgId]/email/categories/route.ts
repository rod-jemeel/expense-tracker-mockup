import { NextRequest } from "next/server"
import { requireOrgAccess } from "@/lib/server/auth-helpers"
import { ApiError, validationError } from "@/lib/errors"
import {
  createEmailCategorySchema,
  listEmailCategoriesSchema,
} from "@/lib/validations/email"
import {
  listEmailCategories,
  createEmailCategory,
} from "@/lib/server/services/email-categories"

type RouteContext = { params: Promise<{ orgId: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { orgId } = await context.params
    const { org } = await requireOrgAccess(orgId)

    const searchParams = request.nextUrl.searchParams
    const query = listEmailCategoriesSchema.safeParse({
      includeInactive: searchParams.get("includeInactive"),
    })

    if (!query.success) {
      return validationError(query.error.issues).toResponse()
    }

    const data = await listEmailCategories({ orgId: org.id, query: query.data })
    return Response.json({ data })
  } catch (error) {
    if (error instanceof ApiError) return error.toResponse()
    console.error("List email categories error:", error)
    return new ApiError("INTERNAL_ERROR", "Failed to list email categories").toResponse()
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { orgId } = await context.params
    const { org, session } = await requireOrgAccess(orgId, ["org_admin", "finance"])

    const body = await request.json()
    const result = createEmailCategorySchema.safeParse(body)

    if (!result.success) {
      return validationError(result.error.issues).toResponse()
    }

    const category = await createEmailCategory({
      orgId: org.id,
      userId: session.user.id,
      data: result.data,
    })
    return Response.json({ data: category }, { status: 201 })
  } catch (error) {
    if (error instanceof ApiError) return error.toResponse()
    console.error("Create email category error:", error)
    return new ApiError("INTERNAL_ERROR", "Failed to create email category").toResponse()
  }
}

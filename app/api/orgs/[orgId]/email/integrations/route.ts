import { NextRequest } from "next/server"
import { requireOrgAccess } from "@/lib/server/auth-helpers"
import { ApiError, validationError } from "@/lib/errors"
import {
  connectEmailAccountSchema,
  listEmailIntegrationsSchema,
} from "@/lib/validations/email"
import {
  listEmailIntegrations,
  connectEmailAccount,
} from "@/lib/server/services/email-integrations"
import { seedMockEmailData } from "@/lib/server/services/email-seed"

type RouteContext = { params: Promise<{ orgId: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { orgId } = await context.params
    const { org } = await requireOrgAccess(orgId)

    const searchParams = request.nextUrl.searchParams
    const query = listEmailIntegrationsSchema.safeParse({
      includeInactive: searchParams.get("includeInactive"),
    })

    if (!query.success) {
      return validationError(query.error.issues).toResponse()
    }

    const data = await listEmailIntegrations({ orgId: org.id, query: query.data })
    return Response.json({ data })
  } catch (error) {
    if (error instanceof ApiError) return error.toResponse()
    console.error("List email integrations error:", error)
    return new ApiError("INTERNAL_ERROR", "Failed to list email integrations").toResponse()
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { orgId } = await context.params
    const { org, session } = await requireOrgAccess(orgId, ["org_admin"])

    const body = await request.json()
    const result = connectEmailAccountSchema.safeParse(body)

    if (!result.success) {
      return validationError(result.error.issues).toResponse()
    }

    const integration = await connectEmailAccount({
      orgId: org.id,
      userId: session.user.id,
      data: result.data,
    })

    // Seed mock data for MVP demo
    try {
      await seedMockEmailData({
        orgId: org.id,
        userId: session.user.id,
        integrationId: integration.id,
      })
    } catch (seedError) {
      console.error("Failed to seed mock email data:", seedError)
      // Don't fail the request if seeding fails
    }

    return Response.json({ data: integration }, { status: 201 })
  } catch (error) {
    if (error instanceof ApiError) return error.toResponse()
    console.error("Connect email account error:", error)
    return new ApiError("INTERNAL_ERROR", "Failed to connect email account").toResponse()
  }
}

import { NextRequest } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { requireOrgAccess } from "@/lib/server/auth-helpers"
import { handleError, validationError, ApiError } from "@/lib/errors"
import { updateOrgSettingsSchema } from "@/lib/validations/organization"

type RouteContext = { params: Promise<{ orgId: string }> }

/**
 * GET /api/orgs/:orgId/settings
 * Get organization settings
 * Roles: org_admin
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { orgId } = await context.params
    const { org } = await requireOrgAccess(orgId, ["org_admin"])

    // Extract settings from org metadata
    const metadata = (org.metadata || {}) as Record<string, unknown>

    return Response.json({
      data: {
        id: org.id,
        name: org.name,
        slug: org.slug,
        defaultTaxRate: metadata.defaultTaxRate ?? 0,
        createdAt: org.createdAt,
      },
    })
  } catch (error) {
    return handleError(error)
  }
}

/**
 * PATCH /api/orgs/:orgId/settings
 * Update organization settings
 * Roles: org_admin
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { orgId } = await context.params
    const { org } = await requireOrgAccess(orgId, ["org_admin"])

    const body = await request.json()
    const result = updateOrgSettingsSchema.safeParse(body)

    if (!result.success) {
      return validationError(result.error.issues).toResponse()
    }

    const { name, defaultTaxRate } = result.data

    // Build update data
    const updateData: {
      name?: string
      metadata?: Record<string, unknown>
    } = {}

    if (name !== undefined) {
      updateData.name = name
    }

    // Merge new metadata with existing metadata
    if (defaultTaxRate !== undefined) {
      const existingMetadata = (org.metadata || {}) as Record<string, unknown>
      updateData.metadata = {
        ...existingMetadata,
        defaultTaxRate,
      }
    }

    // Update organization via Better Auth API
    const updatedOrg = await auth.api.updateOrganization({
      headers: await headers(),
      body: {
        organizationId: org.id,
        data: updateData,
      },
    })

    if (!updatedOrg) {
      throw new ApiError("DATABASE_ERROR", "Failed to update organization")
    }

    // Extract settings from updated org metadata
    const metadata = (updatedOrg.metadata || {}) as Record<string, unknown>

    return Response.json({
      data: {
        id: updatedOrg.id,
        name: updatedOrg.name,
        slug: updatedOrg.slug,
        defaultTaxRate: metadata.defaultTaxRate ?? 0,
        createdAt: updatedOrg.createdAt,
      },
    })
  } catch (error) {
    return handleError(error)
  }
}

import { connection } from "next/server"
import { requireSuperadmin } from "@/lib/server/auth-helpers"
import { handleError } from "@/lib/errors"
import { getAllOrganizations } from "@/lib/server/services/super-dashboard"

/**
 * GET /api/super/organizations
 * List all organizations (superadmin only)
 */
export async function GET() {
  // Mark route as dynamic - auth requires request headers
  await connection()

  try {
    await requireSuperadmin()

    const organizations = await getAllOrganizations()

    return Response.json({ data: organizations })
  } catch (error) {
    return handleError(error)
  }
}

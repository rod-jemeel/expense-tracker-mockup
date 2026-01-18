import { NextResponse } from "next/server"
import { requireOrgAccess } from "@/lib/server/auth-helpers"
import { getNotifications, getUnreadCount } from "@/lib/server/services/notifications"

/**
 * GET /api/orgs/:orgId/notifications
 * List notifications for the current user
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params
    const { session } = await requireOrgAccess(orgId)

    const url = new URL(request.url)
    const includeRead = url.searchParams.get("includeRead") === "true"
    const limit = parseInt(url.searchParams.get("limit") || "20", 10)
    const countOnly = url.searchParams.get("countOnly") === "true"

    if (countOnly) {
      const unreadCount = await getUnreadCount({
        userId: session.user.id,
        orgId,
      })
      return NextResponse.json({ unreadCount })
    }

    const result = await getNotifications({
      userId: session.user.id,
      orgId,
      limit,
      includeRead,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Failed to fetch notifications:", error)
    return NextResponse.json(
      { error: { message: "Failed to fetch notifications" } },
      { status: 500 }
    )
  }
}

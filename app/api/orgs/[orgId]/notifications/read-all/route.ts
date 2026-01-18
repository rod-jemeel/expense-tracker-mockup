import { NextResponse } from "next/server"
import { requireOrgAccess } from "@/lib/server/auth-helpers"
import { markAllNotificationsRead } from "@/lib/server/services/notifications"

/**
 * POST /api/orgs/:orgId/notifications/read-all
 * Mark all notifications as read for the current user
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params
    const { session } = await requireOrgAccess(orgId)

    await markAllNotificationsRead({
      userId: session.user.id,
      orgId,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error)
    return NextResponse.json(
      { error: { message: "Failed to mark notifications as read" } },
      { status: 500 }
    )
  }
}

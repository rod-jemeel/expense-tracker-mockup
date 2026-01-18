import { NextResponse } from "next/server"
import { requireOrgAccess } from "@/lib/server/auth-helpers"
import { markNotificationRead } from "@/lib/server/services/notifications"

/**
 * PATCH /api/orgs/:orgId/notifications/:notificationId
 * Mark a notification as read
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orgId: string; notificationId: string }> }
) {
  try {
    const { orgId, notificationId } = await params
    const { session } = await requireOrgAccess(orgId)

    await markNotificationRead({
      notificationId,
      userId: session.user.id,
      orgId,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to mark notification as read:", error)
    return NextResponse.json(
      { error: { message: "Failed to update notification" } },
      { status: 500 }
    )
  }
}

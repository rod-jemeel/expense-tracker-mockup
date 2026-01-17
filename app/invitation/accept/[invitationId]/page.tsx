import { Suspense } from "react"
import { headers } from "next/headers"
import { connection } from "next/server"
import { auth } from "@/lib/auth"
import { AcceptInvitationForm } from "@/components/invitation/accept-invitation-form"
import { InvalidInvitation } from "@/components/invitation/invalid-invitation"
import { Skeleton } from "@/components/ui/skeleton"

interface AcceptInvitationPageProps {
  params: Promise<{ invitationId: string }>
}

function LoadingSkeleton() {
  return (
    <div className="w-full max-w-sm space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64" />
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}

async function InvitationContent({
  params,
}: {
  params: Promise<{ invitationId: string }>
}) {
  // Mark as dynamic - auth requires request headers
  await connection()

  const { invitationId } = await params

  // Get current session (may be null if not logged in)
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  // Fetch invitation details
  let invitation
  try {
    invitation = await auth.api.getInvitation({
      headers: await headers(),
      query: { id: invitationId },
    })
  } catch {
    // Invitation not found or error fetching
    return (
      <div className="w-full max-w-sm">
        <InvalidInvitation reason="not_found" />
      </div>
    )
  }

  if (!invitation) {
    return (
      <div className="w-full max-w-sm">
        <InvalidInvitation reason="not_found" />
      </div>
    )
  }

  // Check invitation status
  // Better Auth uses "pending" for active invitations and "rejected" for cancelled/declined
  if (invitation.status === "rejected") {
    return (
      <div className="w-full max-w-sm">
        <InvalidInvitation reason="cancelled" />
      </div>
    )
  }

  // If not pending, it's already been processed
  if (invitation.status !== "pending") {
    return (
      <div className="w-full max-w-sm">
        <InvalidInvitation reason="already_accepted" />
      </div>
    )
  }

  // Check if expired
  if (new Date(invitation.expiresAt) < new Date()) {
    return (
      <div className="w-full max-w-sm">
        <InvalidInvitation reason="expired" />
      </div>
    )
  }

  // Transform session for the form component
  const sessionForForm = session
    ? {
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name || "",
        },
      }
    : null

  return (
    <div className="w-full max-w-sm">
      <AcceptInvitationForm
        invitation={{
          id: invitation.id,
          email: invitation.email,
          role: invitation.role,
          status: invitation.status,
          expiresAt: new Date(invitation.expiresAt),
          organization: {
            id: invitation.organizationId,
            name: invitation.organizationName || "Organization",
            slug: invitation.organizationSlug || "",
          },
        }}
        session={sessionForForm}
      />
    </div>
  )
}

export default function AcceptInvitationPage({
  params,
}: AcceptInvitationPageProps) {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <InvitationContent params={params} />
    </Suspense>
  )
}

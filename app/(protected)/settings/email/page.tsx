import { Suspense } from "react"
import { redirect } from "next/navigation"
import { connection } from "next/server"
import { headers } from "next/headers"
import { Mail } from "lucide-react"
import { auth } from "@/lib/auth"
import { EmailAccountList, EmailAccountListSkeleton } from "./_components/email-account-list"
import { ConnectAccountDialog } from "@/components/email"

async function EmailAccountListWithAuth() {
  await connection()

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/auth/sign-in")
  }

  if (!session.session.activeOrganizationId) {
    redirect("/org/select")
  }

  const orgId = session.session.activeOrganizationId

  return <EmailAccountList orgId={orgId} />
}

export default function EmailAccountsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <Mail className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-medium">Email Accounts</h1>
            <p className="text-xs text-muted-foreground">
              Connect your email to automatically detect important emails
            </p>
          </div>
        </div>
        <ConnectAccountDialog />
      </div>

      <Suspense fallback={<EmailAccountListSkeleton />}>
        <EmailAccountListWithAuth />
      </Suspense>
    </div>
  )
}

import { listEmailIntegrations } from "@/lib/server/services/email-integrations"
import { AccountCard, AccountCardSkeleton } from "@/components/email/account-card"

interface EmailAccountListProps {
  orgId: string
}

export async function EmailAccountList({ orgId }: EmailAccountListProps) {
  const data = await listEmailIntegrations({
    orgId,
    query: { includeInactive: true },
  })

  if (data.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
        <p className="text-sm text-muted-foreground">No email accounts connected</p>
        <p className="text-xs text-muted-foreground">
          Connect an account to start detecting important emails
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {data.items.map((integration) => (
        <AccountCard key={integration.id} integration={integration} orgId={orgId} />
      ))}
    </div>
  )
}

export function EmailAccountListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <AccountCardSkeleton key={i} />
      ))}
    </div>
  )
}

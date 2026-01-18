import { listForwardingRules } from "@/lib/server/services/forwarding-rules"
import { listEmailCategories } from "@/lib/server/services/email-categories"
import { RulesContentClient, RulesContentSkeleton } from "./rules-content-client"

interface RulesContentProps {
  orgId: string
}

export async function RulesContent({ orgId }: RulesContentProps) {
  const [rulesData, categoriesData] = await Promise.all([
    listForwardingRules({
      orgId,
      query: { includeInactive: true },
    }),
    listEmailCategories({
      orgId,
      query: { includeInactive: false },
    }),
  ])

  return (
    <RulesContentClient
      rules={rulesData.items}
      categories={categoriesData.items}
      orgId={orgId}
    />
  )
}

export { RulesContentSkeleton }

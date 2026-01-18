"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { Mail, RefreshCw, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import type { EmailIntegration } from "@/lib/server/services/email-integrations"

interface AccountCardProps {
  integration: EmailIntegration
  orgId: string
}

export function AccountCard({ integration, orgId }: AccountCardProps) {
  const router = useRouter()
  const [isSyncing, setIsSyncing] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  const providerName = integration.provider === "gmail" ? "Gmail" : "Outlook"
  const lastSyncText = integration.last_sync_at
    ? formatDistanceToNow(new Date(integration.last_sync_at), { addSuffix: true })
    : "Never synced"

  async function handleSync() {
    setIsSyncing(true)
    try {
      await fetch(`/api/orgs/${orgId}/email/integrations/${integration.id}/sync`, {
        method: "POST",
      })
      router.refresh()
    } catch (error) {
      console.error("Sync failed:", error)
    } finally {
      setIsSyncing(false)
    }
  }

  async function handleDisconnect() {
    setIsDisconnecting(true)
    try {
      await fetch(`/api/orgs/${orgId}/email/integrations/${integration.id}`, {
        method: "DELETE",
      })
      router.refresh()
    } catch (error) {
      console.error("Disconnect failed:", error)
    } finally {
      setIsDisconnecting(false)
    }
  }

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border border-border">
      <div className="size-10 rounded-lg bg-muted flex items-center justify-center">
        <Mail className="size-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-xs font-medium truncate">
            {integration.email_address}
          </p>
          <Badge variant="secondary" className="text-[10px]">
            {providerName}
          </Badge>
          {!integration.is_active && (
            <Badge variant="destructive" className="text-[10px]">
              Inactive
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-[10px] text-muted-foreground">
            Last synced: {lastSyncText}
          </p>
          {integration.sync_error && (
            <p className="text-[10px] text-destructive">
              Error: {integration.sync_error}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1"
          onClick={handleSync}
          disabled={isSyncing}
        >
          <RefreshCw className={`size-3.5 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? "Syncing..." : "Sync Now"}
        </Button>
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
              />
            }
          >
            <Trash2 className="size-3.5" />
            Disconnect
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Disconnect Email Account</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to disconnect {integration.email_address}?
                This will remove the integration and all detected emails from this account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDisconnecting ? "Disconnecting..." : "Disconnect"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

export function AccountCardSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border border-border">
      <div className="size-10 rounded-lg bg-muted animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-40 bg-muted rounded animate-pulse" />
        <div className="h-2.5 w-24 bg-muted rounded animate-pulse" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-7 w-20 bg-muted rounded animate-pulse" />
        <div className="h-7 w-24 bg-muted rounded animate-pulse" />
      </div>
    </div>
  )
}

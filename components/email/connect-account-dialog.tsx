"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

const providers = [
  {
    id: "gmail",
    name: "Gmail",
    icon: "https://www.google.com/favicon.ico",
    description: "Connect your Gmail account",
  },
  {
    id: "outlook",
    name: "Outlook",
    icon: "https://outlook.live.com/favicon.ico",
    description: "Connect your Outlook or Microsoft 365 account",
  },
] as const

export function ConnectAccountDialog() {
  const router = useRouter()
  const { data: activeOrg } = authClient.useActiveOrganization()
  const [open, setOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<"gmail" | "outlook" | null>(null)
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const orgId = activeOrg?.id

  function handleProviderSelect(provider: "gmail" | "outlook") {
    setSelectedProvider(provider)
    setError(null)
  }

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault()
    if (!orgId || !selectedProvider) return

    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch(`/api/orgs/${orgId}/email/integrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: selectedProvider,
          emailAddress: email,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error?.message || "Failed to connect account")
      }

      setOpen(false)
      setSelectedProvider(null)
      setEmail("")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  function handleBack() {
    setSelectedProvider(null)
    setEmail("")
    setError(null)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <Mail className="size-3.5" />
          Connect Account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect Email Account</DialogTitle>
          <DialogDescription>
            {selectedProvider
              ? "Enter your email address to connect"
              : "Choose an email provider to connect"}
          </DialogDescription>
        </DialogHeader>

        {!selectedProvider ? (
          <div className="grid gap-3 py-4">
            {providers.map((provider) => (
              <button
                key={provider.id}
                onClick={() => handleProviderSelect(provider.id)}
                className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
              >
                <div className="size-10 rounded-lg bg-muted flex items-center justify-center">
                  <img
                    src={provider.icon}
                    alt={provider.name}
                    className="size-6"
                  />
                </div>
                <div>
                  <p className="text-xs font-medium">{provider.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {provider.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <form onSubmit={handleConnect}>
            <FieldGroup>
              {error && (
                <FieldError className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                  {error}
                </FieldError>
              )}

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 mb-4">
                <div className="size-8 rounded bg-background flex items-center justify-center">
                  <img
                    src={providers.find((p) => p.id === selectedProvider)?.icon}
                    alt={selectedProvider}
                    className="size-5"
                  />
                </div>
                <div>
                  <p className="text-xs font-medium">
                    {providers.find((p) => p.id === selectedProvider)?.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Demo mode - no actual OAuth required
                  </p>
                </div>
              </div>

              <Field>
                <FieldLabel htmlFor="email">Email Address</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder={`your@${selectedProvider === "gmail" ? "gmail.com" : "outlook.com"}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </Field>

              <div className="flex justify-between gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isLoading}
                >
                  Back
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading || !email}>
                    {isLoading ? "Connecting..." : "Connect Account"}
                  </Button>
                </div>
              </div>
            </FieldGroup>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, CheckCircle, LogOut, Mail, Building2 } from "lucide-react"
import { authClient, signIn, signOut } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  registerViaInvitationSchema,
  type RegisterViaInvitationInput,
} from "@/lib/validations/invitation"

interface Invitation {
  id: string
  email: string
  role: string
  status: string
  expiresAt: Date
  organization: {
    id: string
    name: string
    slug: string
  }
}

interface AcceptInvitationFormProps extends React.ComponentProps<"div"> {
  invitation: Invitation
  session: {
    user: {
      id: string
      email: string
      name: string
    }
  } | null
}

type FormMode = "accept" | "register" | "login" | "email_mismatch"

export function AcceptInvitationForm({
  invitation,
  session,
  className,
  ...props
}: AcceptInvitationFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Determine form mode based on session state
  const getFormMode = (): FormMode => {
    if (session) {
      // User is logged in
      if (session.user.email.toLowerCase() === invitation.email.toLowerCase()) {
        return "accept" // Email matches, just accept
      }
      return "email_mismatch" // Different email, show error
    }
    return "register" // Not logged in, show registration (with login option)
  }

  const [mode, setMode] = useState<FormMode>(getFormMode())

  // Registration form data
  const [registerData, setRegisterData] = useState<
    Omit<RegisterViaInvitationInput, "invitationId">
  >({
    name: "",
    password: "",
  })

  // Login form data
  const [loginData, setLoginData] = useState({
    email: invitation.email,
    password: "",
  })

  // Accept invitation for logged-in user
  const handleAccept = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await authClient.organization.acceptInvitation({
        invitationId: invitation.id,
      })

      // Set the new organization as active
      await authClient.organization.setActive({
        organizationId: invitation.organization.id,
      })

      setSuccess(true)
      router.push("/dashboard")
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to accept invitation"
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Register new user and accept invitation
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const result = registerViaInvitationSchema.safeParse({
      ...registerData,
      invitationId: invitation.id,
    })
    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }

    setIsLoading(true)

    try {
      // Sign up the user
      const signUpResult = await authClient.signUp.email({
        email: invitation.email,
        name: registerData.name,
        password: registerData.password,
      })

      if (signUpResult.error) {
        throw new Error(signUpResult.error.message)
      }

      // Accept the invitation
      await authClient.organization.acceptInvitation({
        invitationId: invitation.id,
      })

      // Set the organization as active
      await authClient.organization.setActive({
        organizationId: invitation.organization.id,
      })

      setSuccess(true)
      router.push("/dashboard")
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create account"
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Login existing user and accept invitation
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await signIn.email({
        email: loginData.email,
        password: loginData.password,
        fetchOptions: {
          onError: (ctx) => {
            throw new Error(ctx.error.message)
          },
        },
      })

      // Accept the invitation
      await authClient.organization.acceptInvitation({
        invitationId: invitation.id,
      })

      // Set the organization as active
      await authClient.organization.setActive({
        organizationId: invitation.organization.id,
      })

      setSuccess(true)
      router.push("/dashboard")
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to login"
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Logout and try again
  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          setMode("register")
        },
      },
    })
  }

  // Success state
  if (success) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="size-6 text-primary" />
            </div>
            <CardTitle>Welcome to {invitation.organization.name}!</CardTitle>
            <CardDescription>
              You&apos;ve successfully joined the organization as{" "}
              <span className="font-medium">{invitation.role}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => router.push("/dashboard")}
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Email mismatch state
  if (mode === "email_mismatch") {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="size-6 text-destructive" />
            </div>
            <CardTitle>Email Mismatch</CardTitle>
            <CardDescription>
              This invitation was sent to{" "}
              <span className="font-medium">{invitation.email}</span>, but
              you&apos;re logged in as{" "}
              <span className="font-medium">{session?.user.email}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="size-4" />
              Sign out and continue
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => router.push("/dashboard")}
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Accept state (logged in with matching email)
  if (mode === "accept") {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <InvitationDetails invitation={invitation} />
        <Card>
          <CardHeader>
            <CardTitle>Accept Invitation</CardTitle>
            <CardDescription>
              You&apos;ve been invited to join{" "}
              <span className="font-medium">{invitation.organization.name}</span>{" "}
              as <span className="font-medium">{invitation.role}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {error && (
              <FieldError className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                {error}
              </FieldError>
            )}
            <Button
              className="w-full"
              onClick={handleAccept}
              disabled={isLoading}
            >
              {isLoading ? "Accepting..." : "Accept Invitation"}
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => router.push("/dashboard")}
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Login mode
  if (mode === "login") {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <InvitationDetails invitation={invitation} />
        <Card>
          <CardHeader>
            <CardTitle>Sign in to accept</CardTitle>
            <CardDescription>
              Sign in with your existing account to accept the invitation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <FieldGroup>
                {error && (
                  <FieldError className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                    {error}
                  </FieldError>
                )}
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    value={loginData.email}
                    disabled
                    className="bg-muted"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    disabled={isLoading}
                    autoComplete="current-password"
                    required
                  />
                </Field>
                <Field>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign in & Accept"}
                  </Button>
                  <FieldDescription className="text-center">
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      className="underline underline-offset-4 hover:text-primary"
                      onClick={() => setMode("register")}
                    >
                      Create one
                    </button>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Register mode (default for non-logged-in users)
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <InvitationDetails invitation={invitation} />
      <Card>
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>
            Enter your details to create an account and join{" "}
            <span className="font-medium">{invitation.organization.name}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister}>
            <FieldGroup>
              {error && (
                <FieldError className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                  {error}
                </FieldError>
              )}
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={invitation.email}
                  disabled
                  className="bg-muted"
                />
                <FieldDescription>
                  This email was specified in the invitation and cannot be
                  changed.
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={registerData.name}
                  onChange={(e) =>
                    setRegisterData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  disabled={isLoading}
                  autoComplete="name"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={registerData.password}
                  onChange={(e) =>
                    setRegisterData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  disabled={isLoading}
                  autoComplete="new-password"
                  required
                />
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
              </Field>
              <Field>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create Account & Join"}
                </Button>
                <FieldDescription className="text-center">
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="underline underline-offset-4 hover:text-primary"
                    onClick={() => setMode("login")}
                  >
                    Sign in
                  </button>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function InvitationDetails({ invitation }: { invitation: Invitation }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Building2 className="size-5 text-primary" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">{invitation.organization.name}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="size-3" />
            <span>{invitation.email}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Role: <span className="font-medium capitalize">{invitation.role}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

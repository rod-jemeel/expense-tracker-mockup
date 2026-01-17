"use client"

import { useRouter } from "next/navigation"
import { AlertTriangle, Clock, CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type InvalidReason = "not_found" | "expired" | "already_accepted" | "cancelled"

interface InvalidInvitationProps extends React.ComponentProps<"div"> {
  reason: InvalidReason
}

const REASON_CONFIG: Record<
  InvalidReason,
  {
    icon: React.ElementType
    iconColor: string
    bgColor: string
    title: string
    description: string
  }
> = {
  not_found: {
    icon: XCircle,
    iconColor: "text-destructive",
    bgColor: "bg-destructive/10",
    title: "Invitation Not Found",
    description:
      "This invitation link is invalid or has been removed. Please contact your organization administrator for a new invitation.",
  },
  expired: {
    icon: Clock,
    iconColor: "text-muted-foreground",
    bgColor: "bg-muted",
    title: "Invitation Expired",
    description:
      "This invitation has expired. Please contact your organization administrator for a new invitation.",
  },
  already_accepted: {
    icon: CheckCircle,
    iconColor: "text-primary",
    bgColor: "bg-primary/10",
    title: "Already Accepted",
    description:
      "This invitation has already been accepted. If you're having trouble accessing the organization, please contact your administrator.",
  },
  cancelled: {
    icon: AlertTriangle,
    iconColor: "text-destructive",
    bgColor: "bg-destructive/10",
    title: "Invitation Cancelled",
    description:
      "This invitation has been cancelled by the organization. Please contact your administrator if you believe this is an error.",
  },
}

export function InvalidInvitation({
  reason,
  className,
  ...props
}: InvalidInvitationProps) {
  const router = useRouter()
  const config = REASON_CONFIG[reason]
  const Icon = config.icon

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <div
            className={cn(
              "mx-auto mb-2 flex size-12 items-center justify-center rounded-full",
              config.bgColor
            )}
          >
            <Icon className={cn("size-6", config.iconColor)} />
          </div>
          <CardTitle>{config.title}</CardTitle>
          <CardDescription>{config.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/auth/sign-in")}
          >
            Go to Sign In
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

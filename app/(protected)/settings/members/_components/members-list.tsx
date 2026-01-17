"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MoreVertical, Trash2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Member {
  id: string
  userId: string
  role: string
  createdAt: Date | string
  user: {
    id: string
    name: string
    email: string
    image?: string
  }
}

interface MembersListProps {
  members: Member[]
  orgId: string
  currentUserId: string
}

const ROLE_COLORS: Record<string, string> = {
  owner: "bg-primary/10 text-primary",
  org_admin: "bg-primary/10 text-primary",
  finance: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  inventory: "bg-green-500/10 text-green-600 dark:text-green-400",
  viewer: "bg-muted text-muted-foreground",
}

export function MembersList({
  members,
  orgId,
  currentUserId,
}: MembersListProps) {
  const router = useRouter()
  const [removingMember, setRemovingMember] = useState<Member | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)

  const handleRemove = async () => {
    if (!removingMember) return

    setIsRemoving(true)
    try {
      const response = await fetch(
        `/api/orgs/${orgId}/members/${removingMember.id}`,
        {
          method: "DELETE",
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error?.message || "Failed to remove member")
      }

      router.refresh()
    } catch (error) {
      console.error("Failed to remove member:", error)
      // Could show a toast here
    } finally {
      setIsRemoving(false)
      setRemovingMember(null)
    }
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    return email.slice(0, 2).toUpperCase()
  }

  const formatRole = (role: string) => {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  if (members.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center">
        <User className="mx-auto size-10 text-muted-foreground" />
        <h3 className="mt-4 text-sm font-medium">No members yet</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Invite team members to get started.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="divide-y divide-border rounded-lg border border-border">
        {members.map((member) => {
          const isCurrentUser = member.userId === currentUserId
          const isOwner = member.role === "owner"
          const canRemove = !isCurrentUser && !isOwner

          return (
            <div
              key={member.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <Avatar className="size-8">
                  <AvatarFallback className="text-xs">
                    {getInitials(member.user.name, member.user.email)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {member.user.name || member.user.email}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (you)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {member.user.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={ROLE_COLORS[member.role] || ROLE_COLORS.viewer}
                >
                  {formatRole(member.role)}
                </Badge>
                {canRemove && (
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                      <MoreVertical className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setRemovingMember(member)}
                      >
                        <Trash2 className="size-3.5" />
                        Remove member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <AlertDialog
        open={!!removingMember}
        onOpenChange={() => setRemovingMember(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove member?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <span className="font-medium">
                {removingMember?.user.name || removingMember?.user.email}
              </span>{" "}
              from the organization? They will lose access to all organization
              data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={isRemoving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemoving ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

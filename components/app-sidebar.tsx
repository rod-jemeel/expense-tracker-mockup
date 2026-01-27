"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  DashboardSquare01Icon,
  Invoice01Icon,
  DeliveryBox01Icon,
  Settings01Icon,
  Logout01Icon,
  Building03Icon,
  ArrowDown01Icon,
  Shield01Icon,
  AiBrain01Icon,
  UserMultiple02Icon,
  Recycle01Icon,
  InboxIcon,
  Share01Icon,
  Mail01Icon,
  Tag01Icon,
  Folder01Icon,
  FlashIcon,
} from "@hugeicons/core-free-icons"
import { authClient } from "@/lib/auth-client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

// Main navigation for regular org context
const mainNav = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: DashboardSquare01Icon,
  },
  {
    title: "Expenses",
    href: "/expenses",
    icon: Invoice01Icon,
  },
  {
    title: "Recurring",
    href: "/expenses/recurring",
    icon: Recycle01Icon,
  },
  {
    title: "Inventory",
    href: "/inventory/items",
    icon: DeliveryBox01Icon,
  },
  {
    title: "AI Assistant",
    href: "/ai",
    icon: AiBrain01Icon,
  },
]

// Settings navigation for regular org context (Email moved to Admin Hub)
const settingsNav = [
  {
    title: "Organization",
    href: "/settings/organization",
    icon: Building03Icon,
  },
  {
    title: "Categories",
    href: "/settings/categories",
    icon: Settings01Icon,
  },
  {
    title: "Members",
    href: "/settings/members",
    icon: UserMultiple02Icon,
  },
  {
    title: "Departments",
    href: "/settings/departments",
    icon: Folder01Icon,
  },
]

// Admin Hub main navigation (superadmin only)
const adminHubMainNav = [
  {
    title: "Dashboard",
    href: "/super",
    icon: DashboardSquare01Icon,
    exact: true,
  },
  {
    title: "Organizations",
    href: "/super/organizations",
    icon: Building03Icon,
  },
  {
    title: "Quick Actions",
    href: "/super/actions",
    icon: FlashIcon,
  },
  {
    title: "AI Assistant",
    href: "/ai",
    icon: AiBrain01Icon,
  },
]

// Admin Hub data navigation - cross-org lists
const adminHubDataNav = [
  {
    title: "Expenses",
    href: "/super/expenses",
    icon: Invoice01Icon,
  },
  {
    title: "Recurring",
    href: "/super/recurring",
    icon: Recycle01Icon,
  },
  {
    title: "Inventory",
    href: "/super/inventory",
    icon: DeliveryBox01Icon,
  },
]

// Admin Hub email navigation - email system management
const adminHubEmailNav = [
  {
    title: "Inbox",
    href: "/super/inbox",
    icon: InboxIcon,
  },
  {
    title: "Rules",
    href: "/super/inbox/rules",
    icon: Share01Icon,
  },
  {
    title: "Email Accounts",
    href: "/super/email-accounts",
    icon: Mail01Icon,
  },
  {
    title: "Email Categories",
    href: "/super/email-categories",
    icon: Tag01Icon,
  },
]

export function AppSidebarSkeleton() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border px-2 py-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="w-full justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="size-4" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="size-3" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {[1, 2, 3].map((i) => (
                <SidebarMenuItem key={i}>
                  <SidebarMenuButton>
                    <Skeleton className="size-4" />
                    <Skeleton className="h-4 w-20" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Skeleton className="size-4" />
                  <Skeleton className="h-4 w-20" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="w-full">
              <Skeleton className="size-6 rounded-full" />
              <div className="flex flex-1 flex-col items-start gap-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-2 w-28" />
              </div>
              <Skeleton className="size-3" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const { data: activeOrg, isPending: orgPending } = authClient.useActiveOrganization()

  // Prevent hydration mismatch: auth state differs between server/client
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if we're in Admin Hub context (any /super route)
  const isAdminHubActive = pathname.startsWith("/super")
  const isSuperadmin = session?.user?.role === "superadmin"

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/auth/sign-in"
        },
      },
    })
  }

  const handleSwitchToAdminHub = () => {
    router.push("/super")
  }

  const handleSwitchToOrg = () => {
    router.push("/dashboard")
  }

  const userInitials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : session?.user?.email?.slice(0, 2).toUpperCase() || "?"

  // Determine header display
  const headerIcon = isAdminHubActive ? Shield01Icon : Building03Icon
  const headerLabel = isAdminHubActive
    ? "Admin Hub"
    : activeOrg?.name || "Select Organization"

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border px-2 py-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    className={`w-full justify-between ${isAdminHubActive ? "bg-primary/10" : ""}`}
                  />
                }
              >
                <div className="flex items-center gap-2">
                  <HugeiconsIcon
                    icon={headerIcon}
                    strokeWidth={2}
                    className="size-4"
                  />
                  {!mounted || (orgPending && !isAdminHubActive) ? (
                    <Skeleton className="h-4 w-24" />
                  ) : (
                    <span className="truncate text-xs font-medium">
                      {headerLabel}
                    </span>
                  )}
                </div>
                <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} className="size-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {/* Admin Hub option (superadmins only) */}
                {isSuperadmin && (
                  <>
                    <DropdownMenuItem
                      onClick={handleSwitchToAdminHub}
                      className={isAdminHubActive ? "bg-muted" : ""}
                    >
                      <HugeiconsIcon icon={Shield01Icon} strokeWidth={2} className="mr-2 size-4" />
                      Admin Hub
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {/* Current org indicator (if in org context) */}
                {!isAdminHubActive && activeOrg && (
                  <>
                    <DropdownMenuItem disabled className="opacity-100">
                      <HugeiconsIcon icon={Building03Icon} strokeWidth={2} className="mr-2 size-4" />
                      <span className="truncate">{activeOrg.name}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {/* Switch to org (if in admin hub) */}
                {isAdminHubActive && activeOrg && (
                  <DropdownMenuItem onClick={handleSwitchToOrg}>
                    <HugeiconsIcon icon={Building03Icon} strokeWidth={2} className="mr-2 size-4" />
                    <span className="truncate">{activeOrg.name}</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem render={<Link href="/org/select" />}>
                  Switch Organization
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {isAdminHubActive ? (
          // Admin Hub navigation with multiple groups
          <>
            <SidebarGroup>
              <SidebarGroupLabel>Admin Hub</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminHubMainNav.map((item) => {
                    const isActive = item.exact
                      ? pathname === item.href
                      : pathname === item.href || pathname.startsWith(item.href + "/")
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={isActive}>
                          <Link href={item.href}>
                            <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Cross-Org Data</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminHubDataNav.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={isActive}>
                          <Link href={item.href}>
                            <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Email System</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminHubEmailNav.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={isActive}>
                          <Link href={item.href}>
                            <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        ) : (
          // Regular org navigation
          <>
            <SidebarGroup>
              <SidebarGroupLabel>Main</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {mainNav.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href || (pathname.startsWith(item.href + "/") && !mainNav.some(nav => nav.href !== item.href && pathname.startsWith(nav.href)))}
                      >
                        <Link href={item.href}>
                          <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Settings</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {settingsNav.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href}
                      >
                        <Link href={item.href}>
                          <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<SidebarMenuButton className="w-full" />}
              >
                <Avatar className="size-6">
                  <AvatarFallback className="text-[10px]">
                    {!mounted || sessionPending ? "..." : userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col items-start text-left">
                  {!mounted || sessionPending ? (
                    <Skeleton className="h-3 w-20" />
                  ) : (
                    <>
                      <span className="truncate text-xs font-medium">
                        {session?.user?.name || "User"}
                      </span>
                      <span className="truncate text-[10px] text-muted-foreground">
                        {session?.user?.email}
                      </span>
                    </>
                  )}
                </div>
                <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} className="size-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem render={<Link href="/settings/profile" />}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} className="size-3.5" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

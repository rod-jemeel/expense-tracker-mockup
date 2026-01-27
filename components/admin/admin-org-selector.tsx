"use client"

import { useState } from "react"
import useSWR from "swr"
import { Building2, ChevronsUpDown, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useAdminOrg } from "@/hooks/use-admin-org"

interface Organization {
  id: string
  name: string
  slug: string
}

interface AdminOrgSelectorProps {
  className?: string
  disabled?: boolean
  onSelect?: (orgId: string, org: Organization) => void
}

// Fetcher for SWR - extracts data array from API response
const orgFetcher = (url: string) =>
  fetch(url)
    .then((res) => res.json())
    .then((data) => (data.data || []) as Organization[])

/**
 * Shared SWR hook for organizations list
 * Deduplicates requests across all AdminOrgSelector instances
 * Caches data to avoid refetching on dialog re-opens
 */
function useOrganizations() {
  return useSWR("/api/super/organizations", orgFetcher, {
    revalidateOnFocus: false, // Don't refetch when switching tabs/dialogs
    revalidateOnReconnect: false,
    dedupingInterval: 60000, // Dedupe requests within 60s
  })
}

export function AdminOrgSelector({
  className,
  disabled,
  onSelect,
}: AdminOrgSelectorProps) {
  const { selectedOrgId, selectOrg, isLoaded } = useAdminOrg()
  const [open, setOpen] = useState(false)
  const { data: organizations = [], isLoading } = useOrganizations()

  const selectedOrg = organizations.find((org) => org.id === selectedOrgId)

  const handleSelect = (orgId: string) => {
    selectOrg(orgId)
    setOpen(false)
    const org = organizations.find((o) => o.id === orgId)
    if (org && onSelect) {
      onSelect(orgId, org)
    }
  }

  if (!isLoaded || isLoading) {
    return (
      <Button
        variant="outline"
        disabled
        className={cn("w-full justify-between", className)}
      >
        <span className="text-muted-foreground">Loading organizations...</span>
      </Button>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between", className)}
        >
          <div className="flex items-center gap-2">
            <Building2 className="size-4 text-muted-foreground" />
            {selectedOrg ? (
              <span>{selectedOrg.name}</span>
            ) : (
              <span className="text-muted-foreground">Select organization...</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search organizations..." />
          <CommandList>
            <CommandEmpty>No organization found.</CommandEmpty>
            <CommandGroup>
              {organizations.map((org) => (
                <CommandItem
                  key={org.id}
                  value={org.name}
                  onSelect={() => handleSelect(org.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      selectedOrgId === org.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{org.name}</span>
                    <span className="text-xs text-muted-foreground">{org.slug}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

/**
 * Compact version of AdminOrgSelector for inline use
 */
export function AdminOrgSelectorCompact({
  className,
  disabled,
  onSelect,
}: AdminOrgSelectorProps) {
  const { selectedOrgId, selectOrg, isLoaded } = useAdminOrg()
  const [open, setOpen] = useState(false)
  const { data: organizations = [], isLoading } = useOrganizations()

  const selectedOrg = organizations.find((org) => org.id === selectedOrgId)

  const handleSelect = (orgId: string) => {
    selectOrg(orgId)
    setOpen(false)
    const org = organizations.find((o) => o.id === orgId)
    if (org && onSelect) {
      onSelect(orgId, org)
    }
  }

  if (!isLoaded || isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled className={className}>
        Loading...
      </Button>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("gap-1 font-normal", className)}
        >
          <Building2 className="size-3.5" />
          {selectedOrg ? selectedOrg.name : "Select org"}
          <ChevronsUpDown className="size-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No organization found.</CommandEmpty>
            <CommandGroup>
              {organizations.map((org) => (
                <CommandItem
                  key={org.id}
                  value={org.name}
                  onSelect={() => handleSelect(org.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      selectedOrgId === org.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {org.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

"use client"

import Link from "next/link"
import {
  Building2,
  Users,
  DollarSign,
  Package,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CreateOrgDialog } from "./create-org-dialog"
import { InviteAdminDialog } from "./invite-admin-dialog"

interface Organization {
  id: string
  name: string
  slug: string
  memberCount: number
  createdAt: string
  monthlyExpenses?: number
  inventoryItemCount?: number
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

function formatCurrency(amount: number) {
  return currencyFormatter.format(amount)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

interface SuperOrganizationsContentClientProps {
  organizations: Organization[]
}

export function SuperOrganizationsContentClient({
  organizations,
}: SuperOrganizationsContentClientProps) {
  if (organizations.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center">
        <Building2 className="mx-auto size-10 text-muted-foreground" />
        <h3 className="mt-4 text-sm font-medium">No organizations yet</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Create your first organization to get started.
        </p>
        <div className="mt-4">
          <CreateOrgDialog />
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Organization</TableHead>
            <TableHead>Members</TableHead>
            <TableHead>Monthly Expenses</TableHead>
            <TableHead>Inventory Items</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[140px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {organizations.map((org) => (
            <TableRow key={org.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                    <Building2 className="size-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{org.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {org.slug}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-xs">
                  <Users className="size-3.5 text-muted-foreground" />
                  <span>{org.memberCount}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-xs">
                  <DollarSign className="size-3.5 text-muted-foreground" />
                  <span>{formatCurrency(org.monthlyExpenses || 0)}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-xs">
                  <Package className="size-3.5 text-muted-foreground" />
                  <span>{org.inventoryItemCount || 0}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-xs text-muted-foreground">
                  {formatDate(org.createdAt)}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <InviteAdminDialog
                    organization={{ id: org.id, name: org.name }}
                  />
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/super/organizations/${org.id}`}>
                      <ExternalLink className="size-3.5" />
                      Manage
                    </Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

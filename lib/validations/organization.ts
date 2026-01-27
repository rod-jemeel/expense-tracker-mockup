import { z } from "zod"

/**
 * Create organization (superadmin only)
 */
export const createOrganizationSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(50, "Slug must be at most 50 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
})

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>

/**
 * Update organization settings
 */
export const updateOrgSettingsSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters")
    .optional(),
  defaultTaxRate: z
    .number()
    .min(0, "Tax rate cannot be negative")
    .max(0.5, "Tax rate cannot exceed 50%")
    .optional(),
})

export type UpdateOrgSettingsInput = z.infer<typeof updateOrgSettingsSchema>

/**
 * Rename organization (superadmin only)
 */
export const renameOrganizationSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
})

export type RenameOrganizationInput = z.infer<typeof renameOrganizationSchema>

/**
 * Superadmin invite member to an organization (any role)
 */
export const superInviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["org_admin", "finance", "inventory", "viewer"], {
    message: "Role must be org_admin, finance, inventory, or viewer",
  }),
})

export type SuperInviteMemberInput = z.infer<typeof superInviteMemberSchema>

/**
 * Update member role (superadmin only)
 */
export const updateMemberRoleSchema = z.object({
  role: z.enum(["org_admin", "finance", "inventory", "viewer"], {
    message: "Role must be org_admin, finance, inventory, or viewer",
  }),
})

export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>

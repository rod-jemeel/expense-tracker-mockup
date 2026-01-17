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

import { z } from "zod"

/**
 * Invite a member to an organization
 * Used by org_admin to invite finance, inventory, viewer roles
 */
export const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["finance", "inventory", "viewer"], {
    message: "Role must be finance, inventory, or viewer",
  }),
})

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>

/**
 * Superadmin invite org_admin to an organization
 */
export const inviteOrgAdminSchema = z.object({
  email: z.string().email("Invalid email address"),
  organizationId: z.string().min(1, "Organization ID is required"),
})

export type InviteOrgAdminInput = z.infer<typeof inviteOrgAdminSchema>

/**
 * Register a new user via invitation
 * New users need to provide name and password when accepting
 */
export const registerViaInvitationSchema = z.object({
  invitationId: z.string().min(1, "Invitation ID is required"),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
})

export type RegisterViaInvitationInput = z.infer<
  typeof registerViaInvitationSchema
>

/**
 * Accept invitation as existing user (logged in)
 */
export const acceptInvitationSchema = z.object({
  invitationId: z.string().min(1, "Invitation ID is required"),
})

export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>

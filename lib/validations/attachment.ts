import { z } from "zod"
import { uuidSchema } from "./common"

/**
 * Linked entity types that can have attachments
 */
export const linkedTypeSchema = z.enum(["expense", "inventory_item"])

export type LinkedType = z.infer<typeof linkedTypeSchema>

/**
 * Create upload URL request body
 */
export const createUploadUrlSchema = z.object({
  linkedType: linkedTypeSchema,
  linkedId: uuidSchema,
  fileName: z
    .string()
    .min(1)
    .max(255)
    .regex(
      /^[a-zA-Z0-9_\-. ]+$/,
      "File name can only contain letters, numbers, underscores, hyphens, dots, and spaces"
    ),
  contentType: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[\w\-+.]+\/[\w\-+.]+$/, "Invalid content type format"),
})

export type CreateUploadUrlInput = z.infer<typeof createUploadUrlSchema>

/**
 * Allowed MIME types for uploads
 */
export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
] as const

/**
 * Max file size (10MB)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024

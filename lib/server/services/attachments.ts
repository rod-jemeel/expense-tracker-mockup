import { supabase } from "@/lib/server/db"
import { ApiError } from "@/lib/errors"
import type { CreateUploadUrlInput, LinkedType } from "@/lib/validations/attachment"
import { ALLOWED_MIME_TYPES } from "@/lib/validations/attachment"

const BUCKET_NAME = process.env.ATTACHMENTS_BUCKET || "attachments"

interface AttachmentRow {
  id: string
  org_id: string
  linked_type: string
  linked_id: string
  storage_path: string
  file_name: string
  mime_type: string
  created_by: string
  created_at: string
}

/**
 * Generate a unique storage path for an attachment
 */
function generateStoragePath(
  orgId: string,
  linkedType: LinkedType,
  linkedId: string,
  fileName: string
): string {
  const timestamp = Date.now()
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9_\-. ]/g, "_")
  return `${orgId}/${linkedType}/${linkedId}/${timestamp}_${sanitizedFileName}`
}

/**
 * Create a signed upload URL for a new attachment
 */
export async function createUploadUrl(data: {
  input: CreateUploadUrlInput
  orgId: string
  userId: string
}): Promise<{ uploadUrl: string; storagePath: string; attachmentId: string }> {
  const { input, orgId, userId } = data

  // Validate mime type
  if (!ALLOWED_MIME_TYPES.includes(input.contentType as typeof ALLOWED_MIME_TYPES[number])) {
    throw new ApiError(
      "VALIDATION_ERROR",
      `File type not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`
    )
  }

  // Generate storage path
  const storagePath = generateStoragePath(
    orgId,
    input.linkedType,
    input.linkedId,
    input.fileName
  )

  // Create attachment record first
  const { data: attachment, error: insertError } = await supabase
    .from("attachments")
    .insert({
      org_id: orgId,
      linked_type: input.linkedType,
      linked_id: input.linkedId,
      storage_path: storagePath,
      file_name: input.fileName,
      mime_type: input.contentType,
      created_by: userId,
    })
    .select()
    .single()

  if (insertError) {
    console.error("Failed to create attachment record:", insertError)
    throw new ApiError("DATABASE_ERROR", "Failed to create attachment")
  }

  // Create signed upload URL (valid for 1 hour)
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUploadUrl(storagePath)

  if (uploadError) {
    console.error("Failed to create upload URL:", uploadError)
    // Rollback attachment record
    await supabase.from("attachments").delete().eq("id", attachment.id)
    throw new ApiError("INTERNAL_ERROR", "Failed to create upload URL")
  }

  return {
    uploadUrl: uploadData.signedUrl,
    storagePath,
    attachmentId: attachment.id,
  }
}

/**
 * Get a signed download URL for an attachment
 */
export async function getDownloadUrl(data: {
  attachmentId: string
  orgId: string
}): Promise<{ url: string; fileName: string; mimeType: string }> {
  const { attachmentId, orgId } = data

  // Get attachment record
  const { data: attachment, error } = await supabase
    .from("attachments")
    .select("*")
    .eq("id", attachmentId)
    .eq("org_id", orgId)
    .single()

  if (error || !attachment) {
    throw new ApiError("ATTACHMENT_NOT_FOUND")
  }

  const typedAttachment = attachment as AttachmentRow

  // Create signed download URL (valid for 1 hour)
  const { data: urlData, error: urlError } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(typedAttachment.storage_path, 3600)

  if (urlError) {
    console.error("Failed to create download URL:", urlError)
    throw new ApiError("INTERNAL_ERROR", "Failed to create download URL")
  }

  return {
    url: urlData.signedUrl,
    fileName: typedAttachment.file_name,
    mimeType: typedAttachment.mime_type,
  }
}

/**
 * Delete an attachment
 */
export async function deleteAttachment(data: {
  attachmentId: string
  orgId: string
}) {
  const { attachmentId, orgId } = data

  // Get attachment record
  const { data: attachment, error } = await supabase
    .from("attachments")
    .select("storage_path")
    .eq("id", attachmentId)
    .eq("org_id", orgId)
    .single()

  if (error || !attachment) {
    throw new ApiError("ATTACHMENT_NOT_FOUND")
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([attachment.storage_path])

  if (storageError) {
    console.error("Failed to delete from storage:", storageError)
    // Continue to delete record even if storage delete fails
  }

  // Delete record
  const { error: deleteError } = await supabase
    .from("attachments")
    .delete()
    .eq("id", attachmentId)
    .eq("org_id", orgId)

  if (deleteError) {
    console.error("Failed to delete attachment record:", deleteError)
    throw new ApiError("DATABASE_ERROR", "Failed to delete attachment")
  }

  return { deleted: true }
}

/**
 * List attachments for a linked entity
 */
export async function listAttachments(data: {
  linkedType: LinkedType
  linkedId: string
  orgId: string
}) {
  const { linkedType, linkedId, orgId } = data

  const { data: attachments, error } = await supabase
    .from("attachments")
    .select("*")
    .eq("org_id", orgId)
    .eq("linked_type", linkedType)
    .eq("linked_id", linkedId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Failed to list attachments:", error)
    throw new ApiError("DATABASE_ERROR", "Failed to list attachments")
  }

  return attachments as AttachmentRow[]
}

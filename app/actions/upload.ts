"use server"

import { put } from "@vercel/blob"

export async function uploadImageAction(formData: FormData) {
  console.log("[v0] Upload action started")
  console.log("[v0] BLOB_READ_WRITE_TOKEN exists:", !!process.env.BLOB_READ_WRITE_TOKEN)

  try {
    const file = formData.get("file") as File

    if (!file) {
      console.log("[v0] No file in FormData")
      return { success: false, error: "No file provided" }
    }

    console.log("[v0] File details:", { name: file.name, size: file.size, type: file.type })

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return { success: false, error: "Only image files are allowed" }
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return { success: false, error: "File size must be less than 5MB" }
    }

    console.log("[v0] Uploading to Vercel Blob...")

    // Upload to Vercel Blob with a unique name
    const blob = await put(`event-photos/${Date.now()}-${file.name}`, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    console.log("[v0] Upload successful:", blob.url)
    return { success: true, url: blob.url }
  } catch (error) {
    console.error("[v0] Upload error details:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload file",
    }
  }
}

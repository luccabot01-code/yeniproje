import { put } from "@vercel/blob"

export async function uploadToVercelBlob(file: File): Promise<string> {
  try {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      throw new Error("Only image files are allowed")
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      throw new Error("File size must be less than 5MB")
    }

    // Upload to Vercel Blob with a unique name
    const blob = await put(`event-photos/${Date.now()}-${file.name}`, file, {
      access: "public",
    })

    return blob.url
  } catch (error) {
    console.error("[v0] Upload error:", error)
    throw error instanceof Error ? error : new Error("Failed to upload file")
  }
}

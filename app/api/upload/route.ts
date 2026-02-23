import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const isImage = file.type.startsWith("image/")
    const isVideo = file.type.startsWith("video/")

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: "Only image and video files are allowed" },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File must be less than 50MB" },
        { status: 400 }
      )
    }

    // Create Supabase admin client for storage upload
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Generate unique filename
    const ext = file.name.split(".").pop() || "bin"
    const prefix = isVideo ? "videos" : "photos"
    const fileName = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

    // Read file as ArrayBuffer and upload
    const arrayBuffer = await file.arrayBuffer()

    const { data, error } = await supabase.storage
      .from("event-media")
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error("Storage upload error:", error)
      return NextResponse.json(
        { error: error.message || "Upload failed" },
        { status: 500 }
      )
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("event-media").getPublicUrl(data.path)

    return NextResponse.json({
      url: publicUrl,
      mediaType: isVideo ? "video" : "image",
      filename: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    )
  }
}

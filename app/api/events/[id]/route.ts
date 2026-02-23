import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"
import { getHostSession } from "@/lib/auth/host-session"
import { revalidatePath } from "next/cache"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const supabase = await createClient()

    const hostEmail = await getHostSession()

    // Build update object only with provided fields
    const updateData: any = { updated_at: new Date().toISOString() }

    if (body.event_type !== undefined) updateData.event_type = body.event_type
    if (body.title !== undefined) updateData.title = body.title
    if (body.date !== undefined) updateData.date = body.date || null
    if (body.location !== undefined) updateData.location = body.location
    if (body.location_url !== undefined) updateData.location_url = body.location_url || null
    if (body.dress_code !== undefined) updateData.dress_code = body.dress_code || null
    if (body.program_notes !== undefined) updateData.program_notes = body.program_notes || null
      if (body.allow_plusone !== undefined) updateData.allow_plusone = body.allow_plusone
      if (body.custom_attendance_options !== undefined) updateData.custom_attendance_options = body.custom_attendance_options
    if (body.theme_color !== undefined) updateData.theme_color = body.theme_color
    if (body.theme_style !== undefined) updateData.theme_style = body.theme_style
    if (body.apply_theme_to_dashboard !== undefined) updateData.apply_theme_to_dashboard = body.apply_theme_to_dashboard
    if (body.cover_image_url !== undefined) updateData.cover_image_url = body.cover_image_url || null
    if (body.media_type !== undefined) updateData.media_type = body.media_type || 'image'
    if (body.registry_url !== undefined) updateData.registry_url = body.registry_url || null
    if (body.itinerary !== undefined) updateData.itinerary = body.itinerary
      if (body.show_countdown !== undefined) updateData.show_countdown = body.show_countdown
        if (body.our_story !== undefined) updateData.our_story = body.our_story
        if (body.menu_options_jsonb !== undefined) updateData.menu_options_jsonb = body.menu_options_jsonb

    if (!hostEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Update the event
    const { data, error } = await supabase
      .from("events")
      .update(updateData)
      .eq("id", id)
      .ilike("host_email", hostEmail) // Security: only allow host to update
      .select()
      .single()

    if (error) {
      console.error("[v0] Event update error:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

      if (data?.slug) {
        revalidatePath(`/rsvp/${data.slug}`)
        revalidatePath(`/dashboard/${data.slug}`)
      }

      return NextResponse.json(data)
    } catch (error) {
      console.error("[v0] Event update error:", error)
        return NextResponse.json({ error: "Failed to update wedding" }, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const hostEmail = await getHostSession()

    if (!hostEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createAdminClient()

    // First verify the event belongs to this host
    const { data: event, error: fetchError } = await supabase
      .from("events")
      .select("id, host_email")
      .eq("id", id)
      .ilike("host_email", hostEmail)
      .single()

    if (fetchError || !event) {
      return NextResponse.json({ error: fetchError ? `DB Fetch Error: ${fetchError.message}` : "Wedding not found or unauthorized" }, { status: 404 })
    }

    // Soft delete by setting is_active to false
    const { data, error } = await supabase
      .from("events")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Event delete error:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] Event delete error:", error)
        return NextResponse.json({ error: "Failed to delete wedding" }, { status: 500 })
  }
}

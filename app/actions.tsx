"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { CreateEventInput } from "@/lib/types"

export async function createEventAction(data: CreateEventInput & { slug: string }) {
  const supabase = await createClient()

  const { data: event, error } = await supabase
    .from("events")
    .insert([
      {
        event_type: data.event_type,
        title: data.title,
        date: data.date,
        location: data.location,
        location_url: data.location_url,
        dress_code: data.dress_code,
        program_notes: data.program_notes,
          allow_plusone: data.allow_plusone ?? true,
          custom_attendance_options: data.custom_attendance_options ?? ["attending", "not_attending"],
        theme_color: data.theme_color ?? "#000000",
        cover_image_url: data.cover_image_url,
        media_type: data.media_type ?? 'image',
        host_name: data.host_name,
        host_email: data.host_email,
        slug: data.slug,
        is_active: true,
        registry_url: data.registry_url,
          itinerary: data.itinerary ?? [],
          show_countdown: data.show_countdown ?? false,
          theme_style: data.theme_style ?? 'default',
          our_story: data.our_story ?? null,
          menu_options_jsonb: data.menu_options_jsonb ?? [],
      },
    ])
    .select()
    .single()

  if (error) {
    console.error("[v0] Database error:", error)
    throw new Error(error.message)
  }

  revalidatePath("/")
  revalidatePath(`/dashboard/${data.slug}`)

  return event
}

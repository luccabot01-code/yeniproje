"use server"

import { redirect } from "next/navigation"
import { createDashboardSession, verifyDashboardAccess } from "@/lib/auth/session"
import { createClient } from "@/lib/supabase/server"

export async function getEventsByEmail(email: string) {
  const supabase = await createClient()

  const { data: events, error } = await supabase
    .from("events")
    .select("id, slug, title, event_type, date, cover_image_url")
    .eq("host_email", email)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching events:", error)
    return []
  }

  return events
}

export async function verifyAndCreateSession(slug: string, email: string) {
  const isValid = await verifyDashboardAccess(slug, email)

  if (!isValid) {
    return { error: "Invalid email address for this wedding" }
  }

  await createDashboardSession(slug, email)
  redirect(`/dashboard/${slug}`)
}

export async function verifyEmailAndGetEvents(email: string, slug?: string) {
  const events = await getEventsByEmail(email)

  if (events.length === 0) {
    return { error: "No weddings found for this email address" }
  }

  // If slug is provided, verify it belongs to this email
  if (slug) {
    const eventExists = events.some((e) => e.slug === slug)
    if (!eventExists) {
      return { error: "Invalid email address for this wedding" }
    }
  }

  return { events }
}

import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"

const SESSION_COOKIE_NAME = "event_dashboard_session"
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours

export interface DashboardSession {
  slug: string
  email: string
  timestamp: number
}

export async function createDashboardSession(slug: string, email: string): Promise<void> {
  const session: DashboardSession = {
    slug,
    email,
    timestamp: Date.now(),
  }

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000, // Convert to seconds
    path: "/",
  })
}

export async function getDashboardSession(slug: string): Promise<string | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

  if (!sessionCookie?.value) {
    return null
  }

  try {
    const session: DashboardSession = JSON.parse(sessionCookie.value)

    // Check if session is expired
    if (Date.now() - session.timestamp > SESSION_DURATION) {
      await clearDashboardSession()
      return null
    }

    // Check if session matches the slug
    if (session.slug !== slug) {
      return null
    }

    return session.email
  } catch {
    return null
  }
}

export async function clearDashboardSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function verifyDashboardAccess(slug: string, email: string): Promise<boolean> {
  const supabase = await createClient()

  const { data: event, error } = await supabase.from("events").select("host_email").eq("slug", slug).single()

  if (error || !event) {
    return false
  }

  return event.host_email.toLowerCase().trim() === email.toLowerCase().trim()
}

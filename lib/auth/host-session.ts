import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"

const HOST_SESSION_COOKIE_NAME = "host_dashboard_session"
const HOST_SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours

export interface HostSession {
  email: string
  timestamp: number
}

export async function createHostSession(email: string): Promise<void> {
  const session: HostSession = {
    email,
    timestamp: Date.now(),
  }

  const cookieStore = await cookies()
  cookieStore.set(HOST_SESSION_COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: HOST_SESSION_DURATION / 1000,
    path: "/",
  })
}

export async function getHostSession(): Promise<string | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(HOST_SESSION_COOKIE_NAME)

  if (!sessionCookie?.value) {
    return null
  }

  try {
    const session: HostSession = JSON.parse(sessionCookie.value)

    // Check if session is expired
    if (Date.now() - session.timestamp > HOST_SESSION_DURATION) {
      await clearHostSession()
      return null
    }

    return session.email.toLowerCase().trim()
  } catch {
    return null
  }
}

export async function clearHostSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(HOST_SESSION_COOKIE_NAME)
}

export async function checkHostStatus(email: string): Promise<{ exists: boolean; tokenUsed: boolean }> {
  const supabase = await createClient()

  const { data: host, error } = await supabase.from("hosts").select("token_used").ilike("email", email).single()

  if (error || !host) {
    return { exists: false, tokenUsed: false }
  }

  return { exists: true, tokenUsed: host.token_used }
}

export async function verifyHostToken(email: string, token: string): Promise<boolean> {
  const supabase = await createClient()

  const { data: host, error } = await supabase
    .from("hosts")
    .select("*")
    .ilike("email", email)
    .eq("token", token)
    .eq("token_used", false)
    .single()

  if (error || !host) {
    return false
  }

  // Mark token as used
  await supabase.from("hosts").update({ token_used: true }).eq("id", host.id)

  return true
}

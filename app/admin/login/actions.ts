"use server"

import { cookies } from "next/headers"

const ADMIN_SESSION_COOKIE = "admin_session"
const ADMIN_EMAIL = "flormontana@etsy.com"
const ADMIN_PASSWORD = "mihail"

export async function adminLogin(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const cookieStore = await cookies()
    cookieStore.set(ADMIN_SESSION_COOKIE, "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    })

    return { success: true }
  }

  return { success: false, error: "Invalid credentials" }
}

export async function adminLogout(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_SESSION_COOKIE)
}

export async function checkAdminAuth(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)
  return session?.value === "authenticated"
}

"use server"

import { verifyHostToken, createHostSession, getHostSession, checkHostStatus } from "@/lib/auth/host-session"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function hostLogin(
  emailInput: string,
  token: string | null,
): Promise<{ success: boolean; error?: string; tokenRequired?: boolean; noEvents?: boolean }> {
  try {
    const email = emailInput.toLowerCase().trim()
    const existingSession = await getHostSession()
    if (existingSession === email) {
      const supabase = await createClient()
      const { data: events } = await supabase
        .from("events")
        .select("id, slug")
        .eq("host_email", email)
        .eq("is_active", true)

      if (!events || events.length === 0) {
        return {
          success: true,
          noEvents: true,
        }
      }

      if (events.length === 1) {
        redirect(`/dashboard/${events[0].slug}`)
      }

      redirect("/dashboard")
    }

    const hostStatus = await checkHostStatus(email)

    if (!hostStatus.exists) {
      return {
        success: false,
        error: "Invalid email or token. Please check your credentials.",
      }
    }

    if (hostStatus.tokenUsed) {
      await createHostSession(email)

      const supabase = await createClient()
      const { data: events } = await supabase
        .from("events")
        .select("id, slug")
        .eq("host_email", email)
        .eq("is_active", true)

      if (!events || events.length === 0) {
        return {
          success: true,
          noEvents: true,
        }
      }

      if (events.length === 1) {
        redirect(`/dashboard/${events[0].slug}`)
      }

      redirect("/dashboard")
    }

    if (!token || token.trim() === "") {
      return {
        success: false,
        error: "Access token is required for first-time login.",
        tokenRequired: true,
      }
    }

    const isValid = await verifyHostToken(email, token)

    if (!isValid) {
      return {
        success: false,
        error: "Invalid email or token. Please check your credentials.",
      }
    }

    await createHostSession(email)

    const supabase = await createClient()
    const { data: events } = await supabase
      .from("events")
      .select("id, slug")
      .eq("host_email", email)
      .eq("is_active", true)

    if (!events || events.length === 0) {
      return {
        success: true,
        noEvents: true,
      }
    }

    if (events.length === 1) {
      redirect(`/dashboard/${events[0].slug}`)
    }

    redirect("/dashboard")
  } catch (error) {
    // Next.js redirect throws a special error that should be re-thrown
    if (typeof error === "object" && error !== null) {
      if ("digest" in error && typeof (error as any).digest === "string") {
        const digest = (error as { digest: string }).digest
        if (digest.includes("NEXT_REDIRECT")) {
          throw error
        }
      }
      // Also check for the error message
      if (error instanceof Error && error.message?.includes("NEXT_REDIRECT")) {
        throw error
      }
    }
    console.error("[v0] Host login error:", error)
    return {
      success: false,
      error: "An error occurred during login. Please try again.",
    }
  }
}

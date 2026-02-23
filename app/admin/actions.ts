"use server"

import { createClient } from "@/lib/supabase/server"
import { checkAdminAuth } from "./login/actions"
import { redirect } from "next/navigation"
import crypto from "crypto"

export async function createHostToken(email: string): Promise<{ success: boolean; token?: string; error?: string }> {
  const isAdmin = await checkAdminAuth()
  if (!isAdmin) {
    redirect("/admin/login")
  }

  try {
    const supabase = await createClient()

    // Generate secure random token
    const token = crypto.randomBytes(32).toString("hex")

    const { data, error } = await supabase
      .from("hosts")
      .insert({
        email,
        token,
        token_used: false,
        sent_via_etsy: false,
      })
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "Email already has a token" }
      }
      throw error
    }

    return { success: true, token }
  } catch (error) {
    console.error("[v0] Create host token error:", error)
    return { success: false, error: "Failed to create token" }
  }
}

export async function markTokenAsSent(hostId: string): Promise<{ success: boolean; error?: string }> {
  const isAdmin = await checkAdminAuth()
  if (!isAdmin) {
    redirect("/admin/login")
  }

  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from("hosts")
      .update({
        sent_via_etsy: true,
        sent_at: new Date().toISOString(),
      })
      .eq("id", hostId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("[v0] Mark token as sent error:", error)
    return { success: false, error: "Failed to update token" }
  }
}

export async function getHostTokens(): Promise<
  { id: string; email: string; token: string; token_used: boolean; sent_via_etsy: boolean; created_at: string }[]
> {
  const isAdmin = await checkAdminAuth()
  if (!isAdmin) {
    redirect("/admin/login")
  }

  try {
    const supabase = await createClient()

    const { data, error } = await supabase.from("hosts").select("*").order("created_at", { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("[v0] Get host tokens error:", error)
    return []
  }
}

export async function deleteHostToken(hostId: string): Promise<{ success: boolean; error?: string }> {
  const isAdmin = await checkAdminAuth()
  if (!isAdmin) {
    redirect("/admin/login")
  }

  try {
    const supabase = await createClient()

    const { error } = await supabase.from("hosts").delete().eq("id", hostId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("[v0] Delete host token error:", error)
    return { success: false, error: "Failed to delete token" }
  }
}

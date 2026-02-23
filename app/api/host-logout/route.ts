import { clearHostSession } from "@/lib/auth/host-session"
import { NextResponse } from "next/server"

export async function POST() {
  await clearHostSession()
  return NextResponse.json({ success: true })
}

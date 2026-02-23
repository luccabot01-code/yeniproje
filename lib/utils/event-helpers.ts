import type { EventType } from "@/lib/types"

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  wedding: "Wedding",
  engagement: "Engagement",
  baby_shower: "Baby Shower",
  bridal_shower: "Bridal Shower",
  anniversary: "Anniversary",
  custom: "Custom Wedding",
}

export const EVENT_TYPE_ICONS: Record<EventType, string> = {
  wedding: "💒",
  engagement: "💍",
  baby_shower: "🍼",
  bridal_shower: "👰",
  anniversary: "🎊",
  custom: "🎉",
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) {
    return "Date not set"
  }

  try {
    // Veritabanından "2026-01-31 20:00" formatında gelir
    // Bu değeri olduğu gibi parse edip göster
    const parts = dateString.trim().split(/[\s\-:T]+/)
    if (parts.length < 5) {
      console.error("[v0] Invalid date format:", dateString)
      return "Invalid date format"
    }

    const [year, month, day, hour, minute] = parts.map(Number)

    // Manuel olarak tarih formatla (timezone conversion yok)
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

    // Basit tarih objesi oluştur (sadece gün hesaplamak için)
    const tempDate = new Date(year, month - 1, day)
    const dayName = dayNames[tempDate.getDay()]
    const monthName = monthNames[month - 1]

    // AM/PM hesapla
    const isPM = hour >= 12
    const displayHour = hour % 12 || 12
    const ampm = isPM ? "PM" : "AM"
    const displayMinute = String(minute).padStart(2, "0")

    return `${dayName}, ${monthName} ${day}, ${year} at ${displayHour}:${displayMinute} ${ampm}`
  } catch (error) {
    console.error("[v0] Error formatting date:", error)
    return "Invalid date format"
  }
}

export function formatShortDate(dateString: string | null | undefined): string {
  if (!dateString) {
    return "Date not set"
  }

  try {
    // "2026-01-31 20:00" → "Jan 31, 2026"
    const parts = dateString.trim().split(/[\s\-:T]+/)
    if (parts.length < 3) {
      return "Invalid date"
    }

    const [year, month, day] = parts.map(Number)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    return `${monthNames[month - 1]} ${day}, ${year}`
  } catch (error) {
    return "Invalid date"
  }
}

export function isRSVPOpen(event: {
  rsvp_deadline?: string | null
  is_active: boolean
}): boolean {
  if (!event.is_active) {
    console.log("[v0] RSVP closed: event is not active")
    return false
  }

  if (!event.rsvp_deadline) {
    console.log("[v0] RSVP open: no deadline set")
    return true
  }

  // Compare plain datetime strings
  // Convert both to comparable formats
  const now = new Date()
  const nowString = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")} ${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")}`

  // Simple string comparison works for YYYY-MM-DD HH:MM format
  const isOpen = event.rsvp_deadline > nowString

  console.log("[v0] RSVP check:", {
    now: nowString,
    deadline: event.rsvp_deadline,
    isOpen,
  })

  return isOpen
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .concat("-", Math.random().toString(36).substring(2, 10))
}

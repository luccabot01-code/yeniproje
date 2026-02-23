"use client"

import { CalendarPlus } from "lucide-react"
import { downloadICSFile, type CalendarEvent } from "@/lib/utils/calendar"

interface AddToCalendarButtonProps {
  event: CalendarEvent
}

export function AddToCalendarButton({ event }: AddToCalendarButtonProps) {
  const handleAddToCalendar = () => {
    downloadICSFile(event)
  }

  return (
    <button
      onClick={handleAddToCalendar}
      className="inline-flex items-center justify-center gap-2 h-10 px-6 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-200 font-medium text-sm border border-primary/20 hover:border-primary/30 hover:shadow-md active:scale-[0.98]"
        aria-label="Add wedding to calendar"
    >
      <CalendarPlus className="h-4 w-4" aria-hidden="true" />
      Add to Calendar
    </button>
  )
}

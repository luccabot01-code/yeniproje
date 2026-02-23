"use client"

import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { RSVP } from "@/lib/types"
import { GripVertical } from "lucide-react"

interface DraggableGuestProps {
  guest: RSVP
}

export function DraggableGuest({ guest }: DraggableGuestProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: guest.id,
    data: { type: "Guest", guest },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    cursor: "grab",
  }

  const accGuests = guest.accompanying_guests ?? []
  const hasPlusone = guest.has_plusone && guest.plusone_name && accGuests.length === 0

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex items-start gap-2 p-2.5 bg-card border rounded-md shadow-sm transition-shadow hover:shadow-md touch-none ${isDragging ? "ring-2 ring-primary ring-offset-1 z-50 relative" : ""}`}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground/40 cursor-grab active:cursor-grabbing flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <p className="font-medium text-[13px] truncate leading-tight">{guest.guest_name}</p>
          {guest.number_of_guests > 1 && (
            <span className="shrink-0 text-[10px] text-muted-foreground bg-muted px-1.5 py-0 rounded-full leading-4">
              ×{guest.number_of_guests}
            </span>
          )}
        </div>

        {(accGuests.length > 0 || hasPlusone) && (
          <div className="mt-1 space-y-0.5">
            {hasPlusone && (
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground min-w-0">
                <span className="opacity-40 shrink-0">└</span>
                <span className="truncate">{guest.plusone_name}</span>
                <span className="opacity-40 text-[10px] shrink-0">Adult</span>
              </div>
            )}
            {accGuests.map((g, i) => {
              const name = [g.firstName, g.lastName].filter(Boolean).join(" ") || `Guest ${i + 1}`
              return (
                <div key={i} className="flex items-center gap-1 text-[11px] text-muted-foreground min-w-0">
                  <span className="opacity-40 shrink-0">└</span>
                  <span className="truncate">{name}</span>
                  {g.isChild ? (
                    <span className="shrink-0 border rounded px-1 py-0 text-[9px] leading-[14px] text-muted-foreground whitespace-nowrap">
                      Child{g.ageRange ? ` ${g.ageRange}` : ""}
                    </span>
                  ) : (
                    <span className="opacity-40 text-[10px] shrink-0">Adult</span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

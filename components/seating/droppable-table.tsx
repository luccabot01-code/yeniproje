"use client"

import { useDroppable } from "@dnd-kit/core"
import { SeatingTable, RSVP } from "@/lib/types"
import { DraggableGuest } from "./draggable-guest"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DroppableTableProps {
  table: SeatingTable
  guests: RSVP[]
  onDelete: (id: string) => void
}

export function DroppableTable({ table, guests, onDelete }: DroppableTableProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: table.id,
    data: { type: "Table", table },
  })

  const seatedCount = guests.reduce((total, guest) => total + guest.number_of_guests, 0)
  const isFull = seatedCount >= table.capacity
  const isOverAndCanDrop = isOver && !isFull
  const isOverAndCannotDrop = isOver && isFull

  let borderColor = "border-border"
  if (isOverAndCanDrop) borderColor = "border-primary bg-primary/5 ring-2 ring-primary/20"
  else if (isOverAndCannotDrop) borderColor = "border-destructive bg-destructive/5 ring-2 ring-destructive/20"

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col border-2 rounded-2xl transition-colors bg-card shadow-sm hover:shadow-md ${borderColor} overflow-hidden`}
    >
      {/* Table header */}
      <div className="p-3 sm:p-4 border-b bg-muted/20 flex flex-col gap-1">
        {table.category && (
          <span className="text-[10px] uppercase font-bold tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full inline-block w-fit">
            {table.category}
          </span>
        )}
        <div className="flex items-center justify-between gap-2 min-w-0">
          <h3 className="font-semibold text-base truncate">{table.name}</h3>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${isFull ? "bg-destructive/10 text-destructive font-medium" : "bg-muted text-muted-foreground"}`}>
              {seatedCount}/{table.capacity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(table.id)}
              title="Delete Table"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Drop zone */}
      <div className="p-2.5 min-h-[120px] sm:min-h-[160px] flex flex-col gap-2 relative">
        {guests.length === 0 && !isOver ? (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground italic pointer-events-none">
            Drag guests here
          </div>
        ) : null}
        {guests.map((guest) => (
          <DraggableGuest key={guest.id} guest={guest} />
        ))}
      </div>
    </div>
  )
}

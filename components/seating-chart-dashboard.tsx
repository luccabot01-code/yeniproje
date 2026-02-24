"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { RSVP, SeatingTable } from "@/lib/types"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, ChevronDown, ChevronUp, Users } from "lucide-react"
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useDroppable, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core"
import { DraggableGuest } from "./seating/draggable-guest"
import { DroppableTable } from "./seating/droppable-table"

interface SeatingChartDashboardProps {
  rsvps: RSVP[]
  eventId: string
}

function UnassignedZone({ guests }: { guests: RSVP[] }) {
  const { isOver, setNodeRef } = useDroppable({ id: "unassigned" })

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 overflow-y-auto p-3 space-y-2 transition-colors ${isOver ? "bg-primary/5 ring-inset ring-2 ring-primary/20" : ""}`}
    >
      {guests.map(guest => (
        <DraggableGuest key={guest.id} guest={guest} />
      ))}
      {guests.length === 0 && (
        <p className="text-center text-sm text-muted-foreground italic mt-8 px-2">All attending guests are seated!</p>
      )}
    </div>
  )
}

export function SeatingChartDashboard({ rsvps, eventId }: SeatingChartDashboardProps) {
  const [tables, setTables] = useState<SeatingTable[]>([])
  const [localGuests, setLocalGuests] = useState<RSVP[]>([])
  const [activeGuest, setActiveGuest] = useState<RSVP | null>(null)
  const [isUnassignedOpen, setIsUnassignedOpen] = useState(false)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  )

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newTableName, setNewTableName] = useState("")
  const [newTableCategory, setNewTableCategory] = useState("")
  const [newTableCapacity, setNewTableCapacity] = useState("8")
  const [deleteTableId, setDeleteTableId] = useState<string | null>(null)

  useEffect(() => {
    setLocalGuests(rsvps.filter(r => r.attendance_status === "attending"))
  }, [rsvps])

  useEffect(() => {
    const fetchTables = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("seating_tables")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: true })
      if (error) {
        console.error("Error fetching tables:", error)
        toast.error("Failed to load seating tables")
      } else {
        setTables(data as SeatingTable[])
      }
    }
    fetchTables()
  }, [eventId])

  const submitNewTable = async () => {
    const name = newTableName.trim()
    if (!name) { toast.error("Table name is required"); return }
    const capacity = parseInt(newTableCapacity, 10)
    if (isNaN(capacity) || capacity <= 0) { toast.error("Invalid capacity"); return }
    const category = newTableCategory.trim()
    const supabase = createClient()
    const { data, error } = await supabase
      .from("seating_tables")
      .insert([{ event_id: eventId, name, capacity, ...(category && { category }) }])
      .select()
      .single()
    if (error) {
      toast.error("Failed to create table.")
    } else {
      setTables([...tables, data as SeatingTable])
      toast.success("Table created")
      setIsModalOpen(false)
      setNewTableName("")
      setNewTableCategory("")
      setNewTableCapacity("8")
    }
  }

  const submitDeleteTable = async () => {
    if (!deleteTableId) return
    const supabase = createClient()
    const originalTables = [...tables]
    const originalGuests = [...localGuests]
    setTables(tables.filter(t => t.id !== deleteTableId))
    setLocalGuests(localGuests.map(g => g.table_id === deleteTableId ? { ...g, table_id: undefined } : g))
    const { error } = await supabase.from("seating_tables").delete().eq("id", deleteTableId)
    if (error) {
      toast.error("Failed to delete table")
      setTables(originalTables)
      setLocalGuests(originalGuests)
    } else {
      toast.success("Table deleted successfully")
    }
    setDeleteTableId(null)
  }

  const onDragStart = (event: DragStartEvent) => {
    const guest = event.active.data.current?.guest as RSVP
    if (guest) setActiveGuest(guest)
  }

  const onDragEnd = async (event: DragEndEvent) => {
    setActiveGuest(null)
    const { active, over } = event
    if (!over) return
    const guestId = active.id as string
    const targetId = over.id as string
    const guest = localGuests.find(g => g.id === guestId)
    if (!guest) return

    let newTableId: string | null = null
    if (targetId !== "unassigned") {
      const targetTable = tables.find(t => t.id === targetId)
      if (!targetTable) return
      const currentCount = localGuests
        .filter(g => g.table_id === targetId && g.id !== guestId)
        .reduce((sum, g) => sum + g.number_of_guests, 0)
      if (currentCount + guest.number_of_guests > targetTable.capacity) {
        toast.error(`Cannot seat ${guest.guest_name}. Table is full!`)
        return
      }
      newTableId = targetId
    }

    if (guest.table_id === newTableId) return

    setLocalGuests(prev => prev.map(g => g.id === guestId ? { ...g, table_id: newTableId || undefined } : g))
    const supabase = createClient()
    const { error } = await supabase.from("rsvps").update({ table_id: newTableId }).eq("id", guestId)
    if (error) {
      toast.error(`Error: ${error.message || "Database update failed"}`)
      setLocalGuests(prev => prev.map(g => g.id === guestId ? { ...g, table_id: guest.table_id } : g))
    } else {
      toast.success(`${guest.guest_name} seated successfully`)
    }
  }

  const unassignedGuests = localGuests.filter(g => !g.table_id)

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="flex flex-col border rounded-lg overflow-hidden bg-background" style={{ height: "calc(100dvh - 180px)", minHeight: 520 }}>

        {/* ── Top bar ── */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 sm:p-4 border-b">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold leading-tight">Seating Chart</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Drag and drop guests to organize tables.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Mobile: unseated count pill that toggles the drawer */}
            <button
              className="sm:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-sm font-medium border"
              onClick={() => setIsUnassignedOpen(v => !v)}
            >
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{unassignedGuests.length} unseated</span>
              {isUnassignedOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            <Button onClick={() => setIsModalOpen(true)} className="gap-1.5 h-9 px-3 text-sm">
              <Plus className="h-4 w-4" />
              <span className="hidden xs:inline">Add Table</span>
              <span className="xs:hidden">Table</span>
            </Button>
          </div>
        </div>

        {/* ── Mobile: collapsible unseated drawer ── */}
        <div className={`sm:hidden flex-shrink-0 border-b bg-muted/20 overflow-hidden transition-all duration-300 ${isUnassignedOpen ? "max-h-64" : "max-h-0"}`}>
          <div className="overflow-y-auto max-h-64">
            <UnassignedZone guests={unassignedGuests} />
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* Desktop sidebar */}
          <div className="hidden sm:flex w-72 lg:w-80 flex-col border-r bg-muted/20 flex-shrink-0">
            <div className="p-3 border-b font-medium bg-muted/50 flex justify-between items-center text-sm">
              <span>Unseated Guests</span>
              <span className="bg-muted px-2 py-0.5 rounded-full text-xs text-muted-foreground">{unassignedGuests.length}</span>
            </div>
            <UnassignedZone guests={unassignedGuests} />
          </div>

          {/* Tables area */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 bg-muted/10">
            {tables.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center border-2 border-dashed rounded-lg text-muted-foreground p-8 gap-4">
                <p className="text-sm">No tables created yet.</p>
                <Button onClick={() => setIsModalOpen(true)} variant="outline" size="sm">Create your first table</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {tables.map(table => (
                  <DroppableTable
                    key={table.id}
                    table={table}
                    guests={localGuests.filter(g => g.table_id === table.id)}
                    onDelete={(id) => setDeleteTableId(id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeGuest ? (
          <div className="opacity-90 scale-105 transform shadow-xl cursor-grabbing">
            <DraggableGuest guest={activeGuest} />
          </div>
        ) : null}
      </DragOverlay>

      {/* Add Table Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full sm:w-[400px] max-w-full rounded-xl bg-background p-6 shadow-lg border">
            <h3 className="mb-4 text-lg font-semibold">Create New Table</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tableName">Table Name</Label>
                <Input id="tableName" value={newTableName} onChange={(e) => setNewTableName(e.target.value)}
                  placeholder="e.g., Family Table, Table 1" autoFocus />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="tableCategory">Category</Label>
                <Input id="tableCategory" value={newTableCategory} onChange={(e) => setNewTableCategory(e.target.value)}
                  placeholder="e.g., Bride's Family" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tableCapacity">Capacity</Label>
                <Input id="tableCapacity" type="number" min="1" value={newTableCapacity}
                  onChange={(e) => setNewTableCapacity(e.target.value)} placeholder="8" />
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-2">
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => {
                setIsModalOpen(false); setNewTableName(""); setNewTableCategory(""); setNewTableCapacity("8")
              }}>Cancel</Button>
              <Button className="w-full sm:w-auto" onClick={submitNewTable}>Create Table</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTableId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full sm:w-[400px] max-w-full rounded-xl bg-background p-6 shadow-lg border">
            <h3 className="mb-2 text-lg font-semibold text-destructive">Delete Table</h3>
            <p className="text-muted-foreground text-sm mb-6">
              <strong className="text-foreground">{tables.find(t => t.id === deleteTableId)?.name}</strong> will be deleted. Guests will be moved back to unseated.
            </p>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => setDeleteTableId(null)}>Cancel</Button>
              <Button variant="destructive" className="w-full sm:w-auto" onClick={submitDeleteTable}>Yes, Delete</Button>
            </div>
          </div>
        </div>
      )}
    </DndContext>
  )
}

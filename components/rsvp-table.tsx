"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { formatShortDate } from "@/lib/utils/event-helpers"
import type { RSVP } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { MessageDialog } from "@/components/message-dialog"

interface RSVPTableProps {
  rsvps: RSVP[]
  eventId: string
  slug: string
  onDelete?: (id: string) => void
}

export function RSVPTable({ rsvps, eventId, slug, onDelete }: RSVPTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [rsvpToDelete, setRsvpToDelete] = useState<RSVP | null>(null)
  const [messageDialogOpen, setMessageDialogOpen] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<{ name: string; message: string } | null>(null)

  const handleDeleteClick = (rsvp: RSVP) => {
    setRsvpToDelete(rsvp)
    setDeleteDialogOpen(true)
  }

  const handleShowMessage = (name: string, message: string) => {
    setSelectedMessage({ name, message })
    setMessageDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!rsvpToDelete) return

    setDeletingId(rsvpToDelete.id)
    setDeleteDialogOpen(false)

    try {
      const supabase = createClient()
      const { error } = await supabase.from("rsvps").delete().eq("id", rsvpToDelete.id).eq("event_id", eventId)

      if (error) throw error

        // Immediately update parent state for instant UI feedback
        onDelete?.(rsvpToDelete.id)
    } catch (error) {
      console.error("[v0] Delete RSVP error:", error)
      alert("Failed to delete RSVP. Please try again.")
    } finally {
      setDeletingId(null)
      setRsvpToDelete(null)
    }
  }

  const truncateText = (text: string, maxLength = 50) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength).trim() + "..."
  }

  /** Render individual party members listed under an RSVP */
  const renderPartyMembers = (rsvp: RSVP) => {
    const members: { name: string; isChild: boolean; ageRange?: string }[] = []

    // accompanying guests (structured)
    if (rsvp.accompanying_guests && rsvp.accompanying_guests.length > 0) {
      rsvp.accompanying_guests.forEach((g) => {
        const name = [g.firstName, g.lastName].filter(Boolean).join(" ") || "Guest"
        members.push({ name, isChild: !!g.isChild, ageRange: g.ageRange })
      })
    } else if (rsvp.has_plusone && rsvp.plusone_name) {
      members.push({ name: rsvp.plusone_name, isChild: false })
    }

    if (members.length === 0) return null

    return (
      <div className="mt-1 space-y-0.5">
        {members.map((m, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
            <span className="text-muted-foreground/40 shrink-0">└</span>
            <span className="break-all">{m.name}</span>
            {m.isChild ? (
              <span className="inline-flex items-center rounded border border-border px-1 py-0 text-[10px] font-medium text-foreground/70 bg-muted/50 leading-4">
                Child{m.ageRange ? `: ${m.ageRange}` : ""}
              </span>
            ) : (
              <span className="inline-flex items-center rounded border border-border px-1 py-0 text-[10px] text-muted-foreground/60 bg-transparent leading-4">
                Adult
              </span>
            )}
          </div>
        ))}
      </div>
    )
  }

  if (rsvps.length === 0) {
    return (
      <Card className="h-full flex flex-col">
        <CardContent className="flex flex-col items-center justify-center flex-1 text-center p-4 md:p-6">
          <p className="text-sm md:text-base text-muted-foreground">
            No RSVPs yet. Share your invitation link to start receiving responses!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="h-full flex flex-col lg:max-h-full lg:overflow-hidden">
        <CardHeader className="flex-shrink-0 p-4 md:px-6 md:pt-6 pb-1">
          <CardTitle className="text-base md:text-lg">Guest Responses</CardTitle>
          <CardDescription className="text-xs md:text-sm">All RSVP submissions for your wedding</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden flex flex-col p-2 md:px-6 md:pt-0 md:pb-6 lg:overflow-y-auto">
          {/* Mobile View - Compact Cards */}
          <div className="md:hidden space-y-3 overflow-y-auto flex-1">
            {rsvps.map((rsvp) => (
              <Card key={rsvp.id} className="relative">
                <CardContent className="p-4 space-y-3 select-text">
                    {/* Name and Status Row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{rsvp.guest_name}</p>
                        {renderPartyMembers(rsvp)}
                      </div>
                    <Badge
                      variant={rsvp.attendance_status === "not_attending" ? "secondary" : "default"}
                      className="flex-shrink-0 text-xs"
                    >
                      {rsvp.attendance_status === "attending" ? "Attending" : "Not Attending"}
                    </Badge>
                  </div>

                  {/* Guest Count and Contact Info */}
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Guests:</span>
                      <span className="font-medium">{rsvp.number_of_guests}</span>
                    </div>
                    {rsvp.guest_email && <div className="truncate text-muted-foreground">{rsvp.guest_email}</div>}
                    {rsvp.guest_phone && <div className="text-muted-foreground">{rsvp.guest_phone}</div>}
                  </div>

                  {/* Message */}
                  {rsvp.message && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground mb-1">Message:</p>
                      <p className="text-xs break-words">{truncateText(rsvp.message, 80)}</p>
                      {rsvp.message.length > 80 && (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs mt-1"
                          onClick={() => handleShowMessage(rsvp.guest_name, rsvp.message!)}
                        >
                          Show more
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Footer: Date and Delete */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-muted-foreground">{formatShortDate(rsvp.created_at)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(rsvp)}
                      disabled={deletingId === rsvp.id}
                      className="h-8 px-2 text-muted-foreground hover:text-destructive gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="text-xs">Delete</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop View - Table (unchanged) */}
          <div className="hidden md:block overflow-auto flex-1">
              <table className="w-full">
                <thead className="sticky top-0 bg-card z-10 border-b">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium select-text">Name & Party</th>
                    <th className="text-left p-3 text-sm font-medium select-text">Status</th>
                    <th className="text-left p-3 text-sm font-medium select-text">Guests</th>
                    <th className="text-left p-3 text-sm font-medium select-text">Contact</th>
                    <th className="text-left p-3 text-sm font-medium select-text min-w-[250px]">Message</th>
                    <th className="text-left p-3 text-sm font-medium select-text">Submitted</th>
                    <th className="text-left p-3 text-sm font-medium select-text w-[80px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rsvps.map((rsvp) => (
                    <tr key={rsvp.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-3 select-text">
                        <div className="font-medium">{rsvp.guest_name}</div>
                        {renderPartyMembers(rsvp)}
                      </td>
                    <td className="p-3 select-text">
                      <Badge variant={rsvp.attendance_status === "not_attending" ? "secondary" : "default"}>
                        {rsvp.attendance_status === "attending" ? "Attending" : "Not Attending"}
                      </Badge>
                    </td>
                    <td className="p-3 select-text">{rsvp.number_of_guests}</td>
                    <td className="p-3 select-text">
                      <div className="text-sm">
                        {rsvp.guest_email && <div>{rsvp.guest_email}</div>}
                        {rsvp.guest_phone && <div className="text-muted-foreground">{rsvp.guest_phone}</div>}
                      </div>
                    </td>
                    <td className="p-3 select-text min-w-[250px]">
                      {rsvp.message ? (
                        <div className="text-sm flex items-start gap-2">
                          <span className="text-muted-foreground flex-1">{truncateText(rsvp.message, 50)}</span>
                          {rsvp.message.length > 50 && (
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-xs flex-shrink-0"
                              onClick={() => handleShowMessage(rsvp.guest_name, rsvp.message!)}
                            >
                              Show more
                            </Button>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No message</span>
                      )}
                    </td>
                    <td className="p-3 text-muted-foreground text-sm select-text">
                      {formatShortDate(rsvp.created_at)}
                    </td>
                    <td className="p-3 select-text">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(rsvp)}
                        disabled={deletingId === rsvp.id}
                        className="h-8 px-2 text-muted-foreground hover:text-destructive gap-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="text-xs">Delete</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        guestName={rsvpToDelete?.guest_name || ""}
      />

      <MessageDialog
        open={messageDialogOpen}
        onOpenChange={setMessageDialogOpen}
        guestName={selectedMessage?.name || ""}
        message={selectedMessage?.message || ""}
      />
    </>
  )
}

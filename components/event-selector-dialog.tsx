"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, Trash2 } from "lucide-react"
import type { Event } from "@/lib/types"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { createBrowserClient } from "@supabase/ssr"
import { motion } from "framer-motion"

interface EventSelectorDialogProps {
  open: boolean
  events: Pick<Event, "id" | "slug" | "title" | "event_type" | "date" | "cover_image_url">[]
  email: string
  onSelectEvent: (slug: string) => Promise<void>
  onClose?: () => void
}

export function EventSelectorDialog({ open, events, email, onSelectEvent, onClose }: EventSelectorDialogProps) {
  const router = useRouter()
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [eventList, setEventList] = useState(events)
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSelectEvent = async (slug: string) => {
    setIsLoading(true)
    setSelectedSlug(slug)

    try {
      await onSelectEvent(slug)
      router.push(`/dashboard/${slug}`)
    } catch (error) {
      console.error("Error creating session:", error)
      setIsLoading(false)
      setSelectedSlug(null)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    setIsDeleting(true)
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )

      // Delete the event
      const { error } = await supabase.from("events").delete().eq("id", eventId)

      if (error) throw error

      // Remove from local state
      setEventList((prev) => prev.filter((e) => e.id !== eventId))
      setDeleteEventId(null)

      // If no events left, close modal
      if (eventList.length === 1) {
        onClose?.()
      }
    } catch (error) {
      console.error("Error deleting event:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getEventTypeLabel = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose?.()}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto overflow-x-hidden" hideCloseButton>
          <button
            onClick={() => onClose?.()}
            className="absolute top-4 right-4 z-50 flex items-center justify-center w-16 h-10 rounded-md bg-white/20 dark:bg-white/20 border border-white/40 text-foreground hover:bg-white/30 hover:scale-105 transition-all duration-200 shadow-lg"
          >
            <span className="text-sm font-medium">Cancel</span>
          </button>

          <motion.div
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.3, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <DialogHeader>
                <DialogTitle className="text-2xl">Select a Wedding</DialogTitle>
                <p className="text-muted-foreground">You have multiple weddings. Choose one to access its dashboard.</p>
            </DialogHeader>
          </motion.div>

          <div className="grid gap-4 mt-4">
            {eventList.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 18, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.32, delay: 0.2 + index * 0.07, ease: [0.22, 1, 0.36, 1] }}
                className="relative group border rounded-lg p-4 hover:border-primary transition-all overflow-hidden"
              >
                <button
                  onClick={() => handleSelectEvent(event.slug)}
                  disabled={isLoading}
                  className="absolute inset-0 z-0 rounded-lg hover:bg-accent/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <div className="flex gap-4 relative z-10 pointer-events-none">
                  {event.cover_image_url && (
                    <div className="w-24 h-24 rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={event.cover_image_url || "/placeholder.svg"}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <div className="flex items-start gap-2">
                      <h3 className="flex-1 font-semibold text-lg break-words overflow-wrap-anywhere min-w-0">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary whitespace-nowrap">
                          {getEventTypeLabel(event.event_type)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteEventId(event.id)
                          }}
                          className="pointer-events-auto p-2 hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors"
                            title="Delete wedding"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                  </div>
                </div>
                  {isLoading && selectedSlug === event.slug && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg z-20">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                  )}
              </motion.div>
              ))}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteEventId !== null} onOpenChange={() => setDeleteEventId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this wedding?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the wedding and all associated RSVP data.
              </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button
              onClick={() => deleteEventId && handleDeleteEvent(deleteEventId)}
              disabled={isDeleting}
              variant="destructive"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

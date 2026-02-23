"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { DashboardStats } from "@/components/dashboard-stats"
import { RSVPTable } from "@/components/rsvp-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { DashboardActions } from "@/components/dashboard-actions"
import { DashboardHeader } from "@/components/dashboard-header"
import { SongRequestsDashboard } from "@/components/song-requests-dashboard"
import { TravelLodgingDashboard } from "@/components/travel-lodging-dashboard"
import { SeatingChartDashboard } from "@/components/seating-chart-dashboard"
import { GuestListCateringDashboard } from "@/components/guest-list-catering-dashboard"
import { BudgetTracker } from "@/components/budget-tracker"
import { WeddingChecklist } from "@/components/wedding-checklist"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { Event, RSVP } from "@/lib/types"

interface DashboardClientProps {
  initialEvent: Event
  slug: string
  eventId: string
}

export function DashboardClient({ initialEvent, slug, eventId }: DashboardClientProps) {
  const [event, setEvent] = useState<Event>(initialEvent)
  const [rsvps, setRsvps] = useState<RSVP[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Apply theme colors globally via data-theme attribute (only if user opted in)
  useEffect(() => {
    const applyToDashboard = event.apply_theme_to_dashboard ?? false
    const theme = applyToDashboard ? (event.theme_style || 'default') : 'default'
    document.documentElement.dataset.theme = theme
    return () => {
      document.documentElement.dataset.theme = 'default'
    }
  }, [event.theme_style, event.apply_theme_to_dashboard])

  const fetchRsvps = useCallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("rsvps")
      .select("*")
      .eq("event_id", eventId)
      .in("attendance_status", ["attending", "not_attending"])
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching RSVPs:", error)
    } else {
      setRsvps(data as RSVP[])
    }
  }, [eventId])

  useEffect(() => {
    const load = async () => {
      await fetchRsvps()
      setIsLoading(false)
    }
    load()
  }, [fetchRsvps])

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`rsvps-${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "rsvps",
          filter: `event_id=eq.${eventId}`,
        },
          (payload: any) => {
            const newRsvp = payload.new as RSVP
            if (newRsvp.attendance_status === "attending" || newRsvp.attendance_status === "not_attending") {
              // Deduplicate: if the RSVP already exists (from initial fetch racing the subscription), replace it
              setRsvps((current) => {
                const exists = current.some((r) => r.id === newRsvp.id)
                if (exists) return current.map((r) => (r.id === newRsvp.id ? newRsvp : r))
                return [newRsvp, ...current]
              })
            }
          },
      )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "rsvps",
            filter: `event_id=eq.${eventId}`,
          },
        (payload: any) => {
          const updatedRsvp = payload.new as RSVP
          setRsvps((current) => current.map((rsvp) => (rsvp.id === updatedRsvp.id ? updatedRsvp : rsvp)))
        },
      )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "rsvps",
            filter: `event_id=eq.${eventId}`,
          },
        (payload: any) => {
          setRsvps((current) => current.filter((rsvp) => rsvp.id !== (payload.old as RSVP).id))
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [eventId])

  const [activeTab, setActiveTab] = useState("overview")
  const [isMenuOpen, setIsMenuOpen] = useState(false)

    const allTabs = [
      { id: "overview", label: "Overview" },
      { id: "budget_tracker", label: "Budget & Expenses" },
      { id: "wedding_checklist", label: "Planning Checklist" },
      { id: "song_requests", label: "Song Requests" },
      { id: "travel_lodging", label: "Travel & Lodging" },
      { id: "seating_chart", label: "Seating Chart" },
      { id: "guest_catering", label: "Guest List & Catering" },
    ]

  const tabVariants = {
    enter: { opacity: 0, filter: "blur(4px)" },
    center: { opacity: 1, filter: "blur(0px)" },
    exit: { opacity: 0, filter: "blur(0px)" },
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div data-dashboard="true" className="min-h-screen bg-background flex flex-col">
        <div className="w-full mx-auto px-4 md:px-6 py-4 max-w-[1600px] flex-1 flex flex-col gap-6">
          <DashboardHeader event={event} onEventUpdate={setEvent} onRefresh={fetchRsvps} />

        {/* Tab bar */}
        <div className="flex flex-wrap items-center gap-2 self-start">
          {/* Desktop: all tabs */}
          <div className="hidden sm:flex flex-wrap gap-2">
            {allTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2 rounded-full text-sm md:text-base font-medium transition-all shrink-0 border ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-md scale-[1.02] border-primary"
                    : "border-border bg-background text-foreground hover:bg-muted"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Mobile: Overview always visible + dropdown for rest */}
          <div className="flex sm:hidden gap-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all border ${
                activeTab === "overview"
                  ? "bg-primary text-primary-foreground shadow-md border-primary"
                  : "border-border bg-background text-foreground hover:bg-muted"
              }`}
            >
              Overview
            </button>
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="bg-background h-10 w-10 rounded-full border-border shadow-sm ml-1 transition-all active:scale-95">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 p-3 rounded-2xl border-border shadow-2xl mt-2 bg-background/95 backdrop-blur-md space-y-1.5">
                {allTabs.filter(t => t.id !== "overview").map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setIsMenuOpen(false) }}
                    className={`w-full flex items-center justify-center px-4 py-3 rounded-full border font-medium text-sm transition-all ${
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border bg-background text-foreground hover:bg-muted"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

          {/* Tab content with AnimatePresence */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={tabVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  enter: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] },
                  center: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] },
                  exit: { duration: 0 },
                }}
                className="w-full"
              >
              {activeTab === "overview" && (
                <div className="flex flex-col lg:grid lg:grid-cols-[1fr_400px] gap-6">
                  <div className="flex flex-col gap-6">
                    <DashboardStats rsvps={rsvps} />
                    <div className="flex-1">
                      <RSVPTable rsvps={rsvps} eventId={event.id} slug={slug} />
                    </div>
                  </div>
                  <div className="space-y-6 lg:order-none order-first">
                    <DashboardActions event={event} rsvps={rsvps} />
                  </div>
                </div>
              )}
              {activeTab === "song_requests" && <SongRequestsDashboard rsvps={rsvps} />}
              {activeTab === "budget_tracker" && <BudgetTracker eventId={eventId} />}
              {activeTab === "wedding_checklist" && <WeddingChecklist eventId={eventId} />}
              {activeTab === "travel_lodging" && <TravelLodgingDashboard rsvps={rsvps} />}
              {activeTab === "seating_chart" && <SeatingChartDashboard rsvps={rsvps} eventId={event.id} />}
              {activeTab === "guest_catering" && <GuestListCateringDashboard rsvps={rsvps} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

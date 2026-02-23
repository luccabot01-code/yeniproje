"use client"

import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { RSVPForm } from "@/components/rsvp-form"
import { Card, CardContent } from "@/components/ui/card"
import { AddToCalendarButton } from "@/components/add-to-calendar-button"
import { Calendar, MapPin } from "lucide-react"
import { formatDate } from "@/lib/utils/event-helpers"
import type { Event } from "@/lib/types"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import React from "react"

interface PageProps {
  params: Promise<{ slug: string }>
}

async function EventDetails({ slug }: { slug: string }) {
  const supabase = await createClient()

  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (error || !event) {
    notFound()
  }

  return (
    <article className="mx-auto max-w-2xl space-y-8">
      <RSVPHeader />

      {/* Event Header */}
      <header className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
            Wedding
          </div>
        <h1 className="text-5xl font-bold tracking-tight text-balance break-words overflow-wrap-anywhere max-w-full px-4">
          {event.title}
        </h1>
        <p className="text-xl text-muted-foreground">You're invited!</p>
      </header>

      {event.cover_image_url && (
        <figure className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-75">
          <div className="relative w-full rounded-xl overflow-hidden shadow-lg">
            <img
              src={event.cover_image_url || "/placeholder.svg"}
                alt={`${event.title} wedding cover`}
              className="w-full h-auto object-contain max-h-[600px] bg-muted"
              loading="eager"
              fetchPriority="high"
            />
          </div>
        </figure>
      )}

      <section aria-label="Wedding details" className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-start gap-4">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" aria-hidden="true" />
              <div className="flex-1">
                <p className="font-semibold mb-2">Date & Time</p>
                <time dateTime={event.date} className="text-muted-foreground block mb-3">
                  {formatDate(event.date)}
                </time>
                <AddToCalendarButton
                  event={{
                    title: event.title,
                    description: event.program_notes,
                    location: event.location,
                    startDate: event.date,
                  }}
                />
              </div>
            </div>

            <div className="flex items-start gap-4">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" aria-hidden="true" />
              <div className="flex-1">
                <p className="font-semibold mb-2">Location</p>
                <address className="text-muted-foreground not-italic mb-3">{event.location}</address>
                {event.location_url && (
                  <a
                    href={event.location_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 h-10 px-6 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-200 font-medium text-sm border border-primary/20 hover:border-primary/30 hover:shadow-md active:scale-[0.98]"
                    aria-label={`View ${event.location} on map`}
                  >
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    View on Map
                  </a>
                )}
              </div>
            </div>

            {event.dress_code && (
              <div className="flex items-start gap-4">
                <div
                  className="h-5 w-5 flex items-center justify-center text-muted-foreground mt-0.5"
                  aria-hidden="true"
                >
                  👔
                </div>
                <div>
                  <p className="font-semibold">Dress Code</p>
                  <p className="text-muted-foreground">{event.dress_code}</p>
                </div>
              </div>
            )}

            {event.program_notes && (
              <div className="pt-4 border-t">
                  <p className="font-semibold mb-2">Wedding Details</p>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{event.program_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section
        aria-labelledby="rsvp-heading"
        className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200"
      >
        <h2 id="rsvp-heading" className="text-3xl font-semibold mb-6 text-center">
          RSVP
        </h2>
        <RSVPForm event={event as Event} />
      </section>
    </article>
  )
}

export function RSVPPageClient({ params }: PageProps) {
  const { slug } = React.use(params) // Use React.use for Promises

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <main className="container mx-auto px-4 py-12" role="main">
        <EventDetails slug={slug} />
      </main>
    </div>
  )
}

function RSVPHeader() {
  const { theme, setTheme } = useTheme()

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="bg-transparent text-xs md:text-sm shadow-[0_0_35px_rgba(0,0,0,0.5)] hover:shadow-[0_0_45px_rgba(0,0,0,0.7)] dark:shadow-[0_0_35px_rgba(251,191,36,0.6)] dark:hover:shadow-[0_0_50px_rgba(251,191,36,0.8)] hover:scale-105 active:scale-95 transition-all duration-300"
            aria-label="Toggle theme"
          >
            <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <MapPin className="absolute h-3.5 w-3.5 md:h-4 md:w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Dark / Light</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

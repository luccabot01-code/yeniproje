"use client"

import type React from "react"
import { useState, useCallback, memo, useEffect, useRef } from "react"
import { RSVPForm } from "@/components/rsvp-form"
import { AddToCalendarButton } from "@/components/add-to-calendar-button"
import { AnimatedBackground } from "@/components/animated-background"
import { Calendar, MapPin, Moon, Sun, Clock, Gift, Sparkles, Shirt, ChevronDown, Heart } from "lucide-react"
import { formatDate } from "@/lib/utils/event-helpers"
import type { Event, ItineraryItem } from "@/lib/types"
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogHeader, DialogDescription } from "@/components/ui/dialog"
import { useTheme } from "next-themes"
import { themeFonts } from "@/lib/fonts"
import { EventCountdown } from "@/components/event-countdown"
import { OurStorySection } from "@/components/our-story-section"
import { motion, useInView, AnimatePresence, useScroll, useTransform } from "framer-motion"

interface RSVPPageClientProps {
  event: Event
}

function FadeUp({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const DetailRow = memo(function DetailRow({
  icon: Icon,
  title,
  children,
}: {
  icon: any
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-4 py-5 border-b border-border/60 last:border-0">
      <div className="mt-0.5 w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/15">
        <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground mb-1">{title}</p>
        {children}
      </div>
    </div>
  )
})

export function RSVPPageClient({ event }: RSVPPageClientProps) {
  const [isRsvpModalOpen, setIsRsvpModalOpen] = useState(false)
  const [showFullDetails, setShowFullDetails] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const videoRef = useRef<HTMLVideoElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)

  const { scrollY } = useScroll()

  const heroScale = useTransform(scrollY, [0, 400], [1, 1.08])
  const heroTextY = useTransform(scrollY, [0, 380], [0, 60])
  const heroOpacity = useTransform(scrollY, [0, 380], [1, 0])
  const headerBg = useTransform(scrollY, [0, 80], [0, 1])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (videoRef.current && event.media_type === 'video') {
      videoRef.current.playbackRate = 0.75
    }
  }, [event.media_type])

  useEffect(() => {
    const t = event.theme_style || 'default'
    document.documentElement.dataset.theme = t
    return () => {
      document.documentElement.dataset.theme = 'default'
    }
  }, [event.theme_style])

  const handleModalSuccess = useCallback(() => setIsRsvpModalOpen(false), [])
  const handleOpenChange = useCallback((open: boolean) => setIsRsvpModalOpen(open), [])

  const handleThemeToggle = () => {
    const current = theme ?? (document.documentElement.classList.contains('dark') ? 'dark' : 'light')
    const newTheme = current === "dark" ? "light" : "dark"
    if (typeof document !== "undefined" && "startViewTransition" in document) {
      ;(document as any).startViewTransition(() => setTheme(newTheme))
    } else {
      setTheme(newTheme)
    }
  }

  const shouldTruncateDetails = (event.program_notes?.split(' ').length ?? 0) > 50
  const truncatedDetails = shouldTruncateDetails
    ? event.program_notes?.split(' ').slice(0, 50).join(' ') + '…'
    : event.program_notes
  const rsvpFont = themeFonts[event.theme_style || 'default']?.family || 'var(--font-geist-sans), sans-serif'
  const hasCover = !!event.cover_image_url

  return (
    <div className="min-h-screen relative bg-background text-foreground" style={{ fontFamily: rsvpFont }}>
      <AnimatedBackground />

      {/* ── Floating glass header ── */}
      <motion.header
        style={{ opacity: headerBg }}
        className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
      >
        <div className="absolute inset-0 bg-background/70 backdrop-blur-xl border-b border-border/40" />
      </motion.header>
      <header className="fixed top-0 left-0 right-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex-1" />
            <div className="flex-shrink-0">
            {mounted && (
              <button
                onClick={handleThemeToggle}
                className="relative h-7 w-[44px] rounded-full bg-muted/70 border border-border/60 transition-colors duration-300 focus:outline-none backdrop-blur-sm"
                aria-label="Toggle theme"
              >
                <div
                  className="absolute top-[3px] h-[22px] w-[22px] rounded-full bg-background shadow-sm flex items-center justify-center transition-transform duration-300"
                  style={{ transform: `translateX(${theme === "dark" ? 18 : 1}px)` }}
                >
                  <Sun className="h-3 w-3 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
                  <Moon className="absolute h-3 w-3 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
                </div>
              </button>
            )}
          </div>
        </div>
      </header>

      <main
        className={`relative z-10 transition-all duration-500 ${isRsvpModalOpen ? "blur-sm" : "blur-0"}`}
        role="main"
      >
        {/* ── HERO ── */}
          {hasCover ? (
      <section ref={heroRef} className="relative h-[60vh] min-h-[420px] max-h-[700px] overflow-hidden sm:h-[70vh]">
              {/* Media */}
              <motion.div
                style={{ scale: heroScale }}
                className="absolute inset-0 origin-center will-change-transform"
              >
                  {event.media_type === 'video' ? (
                    <video
                      ref={videoRef}
                      src={event.cover_image_url}
                      autoPlay muted loop playsInline
                      className="w-full h-full object-cover"
                      onPlay={(e) => { e.currentTarget.playbackRate = 0.75 }}
                    />
                  ) : (
                    <img
                      src={event.cover_image_url}
                      alt={`${event.title} cover`}
                      className="w-full h-full object-cover"
                      loading="eager"
                    />
                  )}
              </motion.div>

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent" />

              {/* Hero text */}
              <motion.div
                style={{ y: heroTextY, opacity: heroOpacity }}
                className="absolute inset-0 flex flex-col items-center justify-end pb-16 px-6 text-white text-center"
              >
                <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.7 }}
                className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6 drop-shadow-lg"
              >
                {event.title}
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65, duration: 0.6 }}
                className="flex flex-wrap items-center justify-center gap-4 text-sm text-white/80"
              >
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(event.date)}
                </span>
                <span className="w-px h-4 bg-white/30" />
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {event.location}
                </span>
              </motion.div>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              style={{ opacity: heroOpacity }}
              className="absolute bottom-5 left-1/2 -translate-x-1/2"
            >
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              >
                <ChevronDown className="h-5 w-5 text-white/50" />
              </motion.div>
            </motion.div>
          </section>
        ) : (
          /* No cover — text-only hero */
          <section className="pt-28 pb-10 text-center px-6">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-4xl sm:text-5xl font-bold tracking-tight mb-4"
            >
              {event.title}
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground"
            >
              <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{formatDate(event.date)}</span>
              <span className="w-px h-4 bg-border self-center" />
              <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{event.location}</span>
            </motion.div>
          </section>
        )}

          {/* Page body */}
          <div className="container mx-auto px-3 sm:px-6 py-6 md:py-14">
            <div className="mx-auto max-w-2xl space-y-4 sm:space-y-5">

            {/* Our Story */}
            {event.show_our_story !== false && event.our_story && event.our_story.length > 0 && (
              <FadeUp delay={0.05}>
                <OurStorySection storyItems={event.our_story} />
              </FadeUp>
            )}

            {/* ── Event Details Card ── */}
            <FadeUp delay={0.1}>
              <section
                aria-label="Wedding details"
                className="rounded-3xl bg-card border border-border/80 shadow-sm overflow-hidden"
              >
                {/* Card header bar */}
                  <div className="px-6 pt-6 pb-4 border-b border-border/60 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                      <h2 className="font-semibold text-base">
                        Wedding Details
                      </h2>
                  </div>

                <div className="px-6 pb-2">
                  <DetailRow icon={Calendar} title="Date & Time">
                    <p className="text-sm text-muted-foreground mb-3">{formatDate(event.date)}</p>
                    <AddToCalendarButton
                      event={{
                        title: event.title,
                        description: event.program_notes,
                        location: event.location,
                        startDate: event.date,
                      }}
                    />
                  </DetailRow>

                  <DetailRow icon={MapPin} title="Location">
                    <p className="text-sm text-muted-foreground mb-3">{event.location}</p>
                    {event.location_url && (
                      <a
                        href={event.location_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-primary text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
                        aria-label={`View ${event.location} on map`}
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        View on Map
                      </a>
                    )}
                  </DetailRow>

                  {event.registry_url && (
                    <DetailRow icon={Gift} title="Gift Registry">
                      <p className="text-sm text-muted-foreground mb-3">Your presence is the greatest gift, but if you wish to contribute...</p>
                      <a
                        href={event.registry_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-primary text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
                      >
                        <Gift className="h-3.5 w-3.5" />
                        Gift Registry
                      </a>
                    </DetailRow>
                  )}

                  {event.dress_code && (
                    <DetailRow icon={Shirt} title="Dress Code">
                      <p className="text-sm text-muted-foreground">{event.dress_code}</p>
                    </DetailRow>
                  )}

                  {event.program_notes && (
                    <div className="py-5 border-t border-border/60">
                      <p className="text-sm font-semibold text-foreground mb-2">Notes</p>
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                          {truncatedDetails}
                        </p>
                      {shouldTruncateDetails && (
                        mounted ? (
                          <Dialog open={showFullDetails} onOpenChange={setShowFullDetails}>
                            <DialogTrigger asChild>
                              <button className="mt-2 text-xs font-semibold text-primary hover:underline underline-offset-2 transition-all">
                                Read more
                              </button>
                            </DialogTrigger>
                            <DialogContent
                              showCloseButton={true}
                              className="max-w-[92vw] sm:max-w-xl max-h-[80vh] overflow-y-auto p-6 bg-background border border-border shadow-2xl rounded-2xl"
                            >
                            <DialogTitle className="text-lg font-bold mb-3">
                                Wedding Details
                              </DialogTitle>
                              <DialogDescription className="sr-only">Full wedding program notes</DialogDescription>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{event.program_notes}</p>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <button className="mt-2 text-xs font-semibold text-primary">Read more</button>
                        )
                      )}
                    </div>
                  )}
                </div>
              </section>
            </FadeUp>

            {/* ── Countdown ── */}
            {event.show_countdown && (
              <FadeUp delay={0.05}>
                <EventCountdown eventDate={event.date} />
              </FadeUp>
            )}

              {/* ── Itinerary ── */}
              {event.show_itinerary !== false && event.itinerary && event.itinerary.length > 0 && (
              <FadeUp delay={0.05}>
                  <ItinerarySection itinerary={event.itinerary} />
              </FadeUp>
            )}

            {/* ── RSVP Button ── */}
            <FadeUp delay={0.05}>
              <section aria-labelledby="rsvp-heading" className="pb-10">
                {/* Divider with hearts */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-border" />
                  <Heart className="h-4 w-4 text-primary fill-primary/20 flex-shrink-0" />
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent via-border to-border" />
                </div>

                {mounted ? (
                  <Dialog open={isRsvpModalOpen} onOpenChange={handleOpenChange}>
                    <DialogTrigger asChild>
                      <motion.button
                        whileHover={{ scale: 1.018, boxShadow: "0 20px 60px -10px rgba(0,0,0,0.35)" }}
                        whileTap={{ scale: 0.982 }}
                        animate={{ y: [0, -5, 0] }}
                        transition={{ y: { duration: 2.2, repeat: Infinity, ease: "easeInOut" } }}
                        className="relative w-full py-4 sm:py-5 rounded-2xl bg-primary text-primary-foreground font-semibold text-base shadow-lg hover:shadow-2xl transition-all duration-300 border border-primary/30 min-h-[56px] overflow-hidden group"
                        id="rsvp-heading"
                      >
                        {/* shimmer sweep */}
                        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                        <span className="relative flex items-center justify-center gap-2">
                          <Heart className="h-4 w-4 fill-primary-foreground/40" />
                          Click here to RSVP
                          <Heart className="h-4 w-4 fill-primary-foreground/40" />
                        </span>
                      </motion.button>
                    </DialogTrigger>

                      <DialogContent
                        showCloseButton={false}
                        overlayClassName="bg-black/60 backdrop-blur-md"
                        className="max-w-[95vw] md:max-w-2xl max-h-[92dvh] overflow-y-auto p-0 gap-0 bg-background border-0 shadow-none rounded-3xl [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-foreground/15 [&::-webkit-scrollbar-thumb]:rounded-full"
                      >
                        {/* ── Luxury modal shell ── */}
                      <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-[0_32px_80px_-12px_rgba(0,0,0,0.55)]">

                          {/* ── Hero banner ── */}
                          <div className="relative overflow-hidden rounded-t-3xl">
                            {/* layered gradient background — always dark so white text is readable */}
                            <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-950 dark:from-neutral-900 dark:via-neutral-950 dark:to-black" />
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12)_0%,transparent_60%)]" />
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,0,0,0.35)_0%,transparent_55%)]" />

                          {/* floating orbs */}
                          <motion.div
                            animate={{ y: [0, -12, 0], x: [0, 8, 0] }}
                            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none"
                          />
                          <motion.div
                            animate={{ y: [0, 10, 0], x: [0, -6, 0] }}
                            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                            className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-white/8 blur-2xl pointer-events-none"
                          />

                          {/* tiny sparkle dots */}
                          {[
                            { top: "18%", left: "12%", delay: 0 },
                            { top: "55%", left: "78%", delay: 0.8 },
                            { top: "30%", left: "60%", delay: 1.6 },
                            { top: "70%", left: "35%", delay: 2.2 },
                            { top: "15%", left: "85%", delay: 0.4 },
                          ].map((dot, i) => (
                            <motion.div
                              key={i}
                              style={{ top: dot.top, left: dot.left }}
                              animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
                              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: dot.delay }}
                              className="absolute w-1 h-1 rounded-full bg-white/70 pointer-events-none"
                            />
                          ))}

                          {/* close button */}
                          <button
                            onClick={() => setIsRsvpModalOpen(false)}
                            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 transition-all duration-200 hover:scale-110 hover:rotate-90 backdrop-blur-sm"
                            aria-label="Close"
                          >
                            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>

                          {/* content */}
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                            className="relative z-10 px-8 pt-10 pb-8 text-white text-center"
                          >
                            {/* ring icon */}
                            <motion.div
                              initial={{ scale: 0, rotate: -15 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1], delay: 0.1 }}
                              className="mx-auto mb-5 w-16 h-16 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center backdrop-blur-sm shadow-lg"
                            >
                              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                              </svg>
                            </motion.div>

                            <motion.p
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2, duration: 0.5 }}
                              className="text-xs font-semibold uppercase tracking-[0.22em] text-white/65 mb-2"
                            >
                              You're Invited
                            </motion.p>
                            <motion.h2
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3, duration: 0.5 }}
                              className="text-3xl font-bold mb-1 tracking-tight"
                            >
                              RSVP
                            </motion.h2>
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.42, duration: 0.5 }}
                              className="text-white/70 text-sm"
                            >
                              Please let us know if you can join us
                            </motion.p>

                            {/* decorative divider */}
                            <motion.div
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: 1 }}
                              transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                              className="mt-6 flex items-center justify-center gap-3"
                            >
                              <div className="h-px w-16 bg-white/30 rounded-full" />
                              <Heart className="h-3 w-3 text-white/50 fill-white/30" />
                              <div className="h-px w-16 bg-white/30 rounded-full" />
                            </motion.div>
                          </motion.div>
                        </div>

                        {/* ── Form body ── */}
                        <motion.div
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                          className="p-6 md:p-8 bg-background rounded-b-3xl"
                        >
                          <RSVPForm event={event} onSuccess={handleModalSuccess} isModal />
                        </motion.div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <button className="w-full py-5 rounded-2xl bg-primary text-primary-foreground font-semibold text-base shadow-lg border border-border/30">
                    Click here to RSVP
                  </button>
                )}
              </section>
            </FadeUp>
          </div>
        </div>
      </main>
    </div>
  )
}

// ── Itinerary ──────────────────────────────────────────────────────────────

function ItinerarySection({ itinerary }: { itinerary: ItineraryItem[] }) {
  return (
    <section
      aria-label="Wedding itinerary"
      className="rounded-3xl bg-card border border-border/80 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-border/60 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <Clock className="h-4 w-4 text-primary" />
        </div>
        <div>
            <p className="font-semibold text-base leading-tight">
                Wedding Timeline
              </p>
          <p className="text-xs text-muted-foreground">Schedule of the day</p>
        </div>
      </div>

      {/* Mobile: vertical list */}
      <div className="block md:hidden px-6 py-5">
        <div className="relative pl-5">
          <div className="absolute left-[7px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 via-primary/20 to-transparent rounded-full" />
          <div className="space-y-6">
            {itinerary.map((item, i) => (
              <MobileItineraryItem key={i} item={item} index={i} />
            ))}
          </div>
        </div>
      </div>

      {/* Desktop: horizontal zigzag */}
      <div className="hidden md:block px-6 py-8 relative overflow-x-auto">
        <div className="relative min-h-[220px] flex items-center min-w-[500px]">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-transparent via-primary/25 to-transparent rounded-full" />
          <div className="flex w-full justify-between items-center">
            {itinerary.map((item, i) => (
              <DesktopItineraryItem key={i} item={item} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function MobileItineraryItem({ item, index }: { item: ItineraryItem; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "0px 0px -20px 0px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -14 }}
      animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -14 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: index * 0.08 }}
      className="relative"
    >
      <div className="absolute -left-5 top-1.5 w-3.5 h-3.5 rounded-full bg-primary border-2 border-background shadow-sm ring-2 ring-primary/20 -translate-x-[3px]" />
      {item.time && (
        <span className="text-xs font-bold text-primary tracking-wide">{item.time}</span>
      )}
      <h4 className="font-semibold text-sm mt-0.5">{item.title}</h4>
      {item.description && (
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.description}</p>
      )}
    </motion.div>
  )
}

function DesktopItineraryItem({ item, index }: { item: ItineraryItem; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "0px 0px -30px 0px" })
  const isAbove = index % 2 === 0

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: isAbove ? -20 : 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: isAbove ? -20 : 20 }}
      transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94], delay: index * 0.1 }}
      className={`flex flex-col items-center flex-1 px-3 ${isAbove ? 'flex-col-reverse' : 'flex-col'}`}
    >
      <div className={`text-center w-full ${isAbove ? 'mb-5' : 'mt-5'}`}>
        {item.time && (
          <span className="inline-block text-xs font-bold text-primary mb-1 tracking-wide">{item.time}</span>
        )}
        <h4 className="font-semibold text-sm leading-tight">{item.title}</h4>
        {item.description && (
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.description}</p>
        )}
      </div>
      <div className="w-3.5 h-3.5 rounded-full bg-primary border-2 border-background shadow-md ring-[3px] ring-primary/20 z-10 flex-shrink-0" />
      <div className={`${isAbove ? 'mt-5' : 'mb-5'} h-20`} />
    </motion.div>
  )
}

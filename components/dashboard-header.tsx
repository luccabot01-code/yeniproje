"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Calendar, MapPin, Pencil, Plus, Palette, Check, Menu } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { formatDate } from "@/lib/utils/event-helpers"
import type { Event } from "@/lib/types"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Dialog, DialogContent, DialogClose, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { EventEditForm } from "@/components/event-edit-form"
import { DashboardHelpDialog } from "@/components/dashboard-help-dialog"
import { ThemeToggle } from "@/components/theme-toggle"
import { motion } from "framer-motion"

interface DashboardHeaderProps {
  event: Event
  onEventUpdate?: (event: Event) => void
  onRefresh?: () => Promise<void>
}

export function DashboardHeader({ event, onEventUpdate, onRefresh }: DashboardHeaderProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false)
  const [isVideoBlurred, setIsVideoBlurred] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [currentTheme, setCurrentTheme] = useState(event.theme_style || "default")
  const [applyToDashboard, setApplyToDashboard] = useState(event.apply_theme_to_dashboard ?? false)
  const [isUpdatingTheme, setIsUpdatingTheme] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleRefresh = async () => {
    if (isRefreshing) return
    setIsRefreshing(true)
    try {
      if (onRefresh) await onRefresh()
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleThemeChange = async (newTheme: string) => {
    if (newTheme === currentTheme) return

    setIsUpdatingTheme(true)
    const previousTheme = currentTheme
    setCurrentTheme(newTheme)
    // Instantly apply theme colors via CSS variables
    if (applyToDashboard) {
      document.documentElement.dataset.theme = newTheme
    }

    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ theme_style: newTheme, host_email: event.host_email }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Theme update API error:", {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        })
        throw new Error(`Failed to update theme: ${errorData.error || response.statusText}`)
      }

      if (onEventUpdate) onEventUpdate({ ...event, theme_style: newTheme })
    } catch (error) {
      console.error("Error updating theme:", error)
      setCurrentTheme(previousTheme) // Revert on failure
      if (applyToDashboard) {
        document.documentElement.dataset.theme = previousTheme
      }
    } finally {
      setIsUpdatingTheme(false)
    }
  }

  return (
      <div className="w-full flex items-start md:items-center justify-between gap-3 md:gap-4 pb-4 md:pb-6 border-b">
        <div className="flex items-start md:items-center gap-3 md:gap-4 lg:gap-6 min-w-0 overflow-hidden">
        {/* Wedding Title & Date */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 md:gap-3 mb-1">
            {/* Video/Image Thumbnail - always visible */}
            {event.cover_image_url && (
              <Dialog open={isImagePreviewOpen} onOpenChange={setIsImagePreviewOpen}>
                <DialogTrigger asChild>
                  <button className="rounded-md overflow-hidden border border-border/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex-shrink-0">
                    {event.media_type === "video" ? (
                      <video
                        src={`${event.cover_image_url}#t=0.1`}
                        className="w-8 h-8 md:w-10 md:h-10 object-cover"
                        preload="metadata"
                        muted
                        playsInline
                        controls={false}
                        autoPlay={false}
                      />
                    ) : (
                      <img
                        src={event.cover_image_url || "/placeholder.svg"}
                        alt={event.title}
                        className="w-8 h-8 md:w-10 md:h-10 object-cover"
                      />
                    )}
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] md:max-w-5xl max-h-[90vh] overflow-y-auto p-6 md:p-8 bg-background border border-border shadow-2xl" showCloseButton={false}>
                  <DialogTitle className="sr-only">Wedding Cover Image</DialogTitle>
                    <button
                      onClick={() => setIsImagePreviewOpen(false)}
                      className="absolute top-4 right-4 group flex items-center justify-center w-10 h-10 rounded-2xl bg-muted/70 hover:bg-foreground border border-border/50 hover:border-foreground backdrop-blur-sm transition-all duration-200 hover:scale-110 active:scale-95 touch-manipulation z-50 cursor-pointer"
                      aria-label="Close"
                    >
                      <svg className="h-4 w-4 text-foreground/60 group-hover:text-background transition-colors duration-200 group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                  <div className="relative w-full h-full flex items-center justify-center">
                    {event.media_type === "video" ? (
                      <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-lg">
                        <video
                          ref={videoRef}
                          src={event.cover_image_url}
                          autoPlay
                          muted
                          loop
                          playsInline
                          className={`w-full h-auto object-contain max-h-[80vh] rounded-lg pointer-events-none transition-all duration-500 relative z-10 ${isVideoBlurred ? "blur-md opacity-80" : "blur-0 opacity-100"
                            }`}
                          onTimeUpdate={(e) => {
                            const video = e.currentTarget
                            if (video.duration && video.duration - video.currentTime < 0.8) {
                              setIsVideoBlurred(true)
                            } else if (video.currentTime < 0.3) {
                              setIsVideoBlurred(false)
                            }
                          }}
                          onPlay={(e) => {
                            e.currentTarget.playbackRate = 0.75
                          }}
                        />
                        <video
                          src={event.cover_image_url}
                          autoPlay
                          muted
                          loop
                          playsInline
                          className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-30 pointer-events-none scale-110"
                        />
                      </div>
                    ) : (
                      <img
                        src={event.cover_image_url || "/placeholder.svg"}
                        alt={event.title}
                        className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                      />
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}
            <h1 className="text-base md:text-xl lg:text-2xl font-semibold tracking-tight truncate">{event.title}</h1>
          </div>
          <div className="flex items-center gap-1.5 md:gap-3 text-[10px] md:text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3 md:h-3.5 md:w-3.5" />
              {formatDate(event.date)}
            </span>
            <span className="flex items-center gap-1 truncate">
              <MapPin className="h-3 w-3 md:h-3.5 md:w-3.5" />
              <span className="truncate max-w-[120px] sm:max-w-[200px]">{event.location}</span>
            </span>
          </div>
        </div>
      </div>

       {/* Desktop: show all buttons inline */}
       <div className="hidden md:flex items-center gap-2 flex-shrink-0">
         {/* Theme Toggle */}
           <ThemeToggle inline />


          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                disabled={isUpdatingTheme}
                className="relative group inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                  bg-background border border-border hover:bg-muted
                  text-foreground
                  shadow-sm hover:shadow-md
                  transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
               <svg className="h-4 w-4 transition-transform duration-500 group-hover:rotate-[30deg]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a9 9 0 100 18A9 9 0 0012 3zm0 0c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9m0-18C9.5 5.5 8 8.5 8 12s1.5 6.5 4 9M3.6 9h16.8M3.6 15h16.8" />
               </svg>
               <span>Theme RSVP</span>
               {isUpdatingTheme && (
                 <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/60 backdrop-blur-sm">
                   <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
                 </span>
               )}
             </button>
           </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
             {[
               { id: 'default', name: 'Default (Modern)', color: 'bg-zinc-900 dark:bg-zinc-100' },
               { id: 'minimalist', name: 'Minimalist', color: 'bg-slate-800 dark:bg-slate-200' },
               { id: 'rustic', name: 'Rustic', color: 'bg-[#8B4513] dark:bg-[#D2691E]' },
               { id: 'floral', name: 'Floral', color: 'bg-[#C2185B] dark:bg-[#F06292]' },
               { id: 'ocean', name: 'Ocean', color: 'bg-[#0369A1] dark:bg-[#38BDF8]' },
               { id: 'vintage', name: 'Vintage', color: 'bg-[#92400E] dark:bg-[#D97706]' },
               { id: 'lavender', name: 'Lavender', color: 'bg-[#6D28D9] dark:bg-[#A78BFA]' },
               { id: 'emerald', name: 'Emerald', color: 'bg-[#065F46] dark:bg-[#34D399]' },
               { id: 'midnight', name: 'Midnight', color: 'bg-[#1E1B4B] dark:bg-[#C4B500]' }
             ].map(themeOption => (
              <DropdownMenuItem
                key={themeOption.id}
                onClick={() => handleThemeChange(themeOption.id)}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${themeOption.color}`} />
                  <span>{themeOption.name}</span>
                </div>
                {currentTheme === themeOption.id && <Check className="h-4 w-4 text-primary" />}
              </DropdownMenuItem>
            ))}
            <Separator className="my-1" />
            <div className="flex items-center justify-between px-2 py-2">
              <label htmlFor="theme-dashboard-toggle" className="text-sm cursor-pointer select-none">
                Apply to Dashboard
              </label>
              <Switch
                id="theme-dashboard-toggle"
                checked={applyToDashboard}
                onCheckedChange={async (checked: boolean) => {
                  const prev = applyToDashboard
                  setApplyToDashboard(checked)
                  // Immediately update data-theme
                  document.documentElement.dataset.theme = checked ? (currentTheme || 'default') : 'default'
                  try {
                      const response = await fetch(`/api/events/${event.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ apply_theme_to_dashboard: checked, host_email: event.host_email }),
                      })
                      if (!response.ok) throw new Error("Failed")
                      if (onEventUpdate) onEventUpdate({ ...event, apply_theme_to_dashboard: checked })
                  } catch {
                    setApplyToDashboard(prev)
                    document.documentElement.dataset.theme = prev ? (currentTheme || 'default') : 'default'
                  }
                }}
              />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                bg-background border border-border hover:bg-muted
                text-foreground
                shadow-sm hover:shadow-md
                transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
            >
             <svg className="h-4 w-4 transition-transform duration-300 group-hover:rotate-[-8deg]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
             </svg>
               <span>Edit Wedding</span>
             </button>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
              bg-background border border-border hover:bg-muted
              text-foreground
              shadow-sm hover:shadow-md
              transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
           <svg className={`h-4 w-4 transition-transform duration-500 ${isRefreshing ? "animate-spin" : "group-hover:rotate-180"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
             <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
           </svg>
           <span>Refresh</span>
         </button>

          <button
            onClick={() => setIsHelpOpen(true)}
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
              bg-background border border-border hover:bg-muted
              text-foreground
              shadow-sm hover:shadow-md
              transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
          >
           <svg className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
             <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
           </svg>
           <span>Help</span>
         </button>
         <DashboardHelpDialog open={isHelpOpen} onOpenChange={setIsHelpOpen} />
      </div>

         {/* Mobile: compact toggle + help + hamburger */}
         <div className="flex md:hidden items-center gap-1.5 flex-shrink-0">
          {/* Compact dark/light toggle */}
          <ThemeToggle inline />

         {/* Hamburger menu */}
        <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
         <DropdownMenuTrigger asChild>
             <button
               className="flex items-center justify-center h-8 w-8 rounded-lg border border-border bg-transparent hover:bg-muted transition-colors"
             >
               <Menu className="h-4 w-4" />
               <span className="sr-only">Menu</span>
             </button>
           </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 p-3 rounded-2xl border-border shadow-2xl mt-2 overflow-hidden bg-background/95 backdrop-blur-md space-y-3">
            <div className="px-1 py-1">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-3 block">Theme RSVP</span>
              <div className="flex flex-wrap gap-2">
                 {[
                   { id: 'default', name: 'Default', color: 'bg-zinc-900 dark:bg-zinc-100' },
                   { id: 'minimalist', name: 'Minimal', color: 'bg-slate-800 dark:bg-slate-200' },
                   { id: 'rustic', name: 'Rustic', color: 'bg-[#8B4513] dark:bg-[#D2691E]' },
                   { id: 'floral', name: 'Floral', color: 'bg-[#C2185B] dark:bg-[#F06292]' },
                   { id: 'ocean', name: 'Ocean', color: 'bg-[#0369A1] dark:bg-[#38BDF8]' },
                   { id: 'vintage', name: 'Vintage', color: 'bg-[#92400E] dark:bg-[#D97706]' },
                   { id: 'lavender', name: 'Lavender', color: 'bg-[#6D28D9] dark:bg-[#A78BFA]' },
                   { id: 'emerald', name: 'Emerald', color: 'bg-[#065F46] dark:bg-[#34D399]' },
                   { id: 'midnight', name: 'Midnight', color: 'bg-[#1E1B4B] dark:bg-[#C4B500]' }
                 ].map(themeOption => (
                  <button
                    key={themeOption.id}
                    onClick={() => handleThemeChange(themeOption.id)}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${themeOption.color} ${currentTheme === themeOption.id ? 'border-primary ring-2 ring-primary/30 scale-110' : 'border-border hover:scale-105'}`}
                    title={themeOption.name}
                  />
                ))}
              </div>
            </div>

            <Separator className="bg-border" />

            <div className="space-y-2.5">
              <DropdownMenuItem
                onClick={() => { setMobileMenuOpen(false); setIsEditModalOpen(true) }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full border border-border bg-background text-foreground font-medium hover:bg-muted focus:bg-muted transition-all cursor-pointer active:scale-95 shadow-sm"
              >
                <Pencil className="h-4 w-4" />
                <span>Edit Wedding</span>
              </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => { setMobileMenuOpen(false); handleRefresh() }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full border border-border bg-background text-foreground font-medium hover:bg-muted focus:bg-muted transition-all cursor-pointer active:scale-95 shadow-sm"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => { setMobileMenuOpen(false); setIsHelpOpen(true) }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full border border-border bg-background text-foreground font-medium hover:bg-muted focus:bg-muted transition-all cursor-pointer active:scale-95 shadow-sm"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                  </svg>
                  <span>Help</span>
                </DropdownMenuItem>

              </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

        {/* Edit Wedding Dialog (shared for mobile and desktop) */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent
            className="max-w-[95vw] md:max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-0 shadow-[0_32px_80px_-12px_rgba(0,0,0,0.35)] rounded-3xl bg-background [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-foreground/15 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-foreground/30 [scrollbar-width:thin]"
            showCloseButton={false}
          >
              <DialogTitle className="sr-only">Edit Wedding</DialogTitle>

            {/* Sticky header */}
            <div className="sticky top-0 z-20 flex items-center justify-between px-7 py-5 bg-background/95 backdrop-blur-sm border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-foreground text-background shadow-sm">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                  </svg>
                </div>
                <div>
                    <h2 className="text-base font-bold tracking-tight text-foreground leading-none">Edit Wedding</h2>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Update your wedding details and settings</p>
                </div>
              </div>
              <DialogClose asChild>
                  <button
                    className="group flex items-center justify-center w-9 h-9 rounded-2xl bg-muted/70 hover:bg-foreground border border-border/50 hover:border-foreground backdrop-blur-sm transition-all duration-200 hover:scale-110 active:scale-95 touch-manipulation"
                    aria-label="Close"
                  >
                    <svg className="h-4 w-4 text-foreground/60 group-hover:text-background transition-colors duration-200 group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </DialogClose>
            </div>

            <div className="px-7 py-6">
              <EventEditForm event={event} onSuccess={(updatedEvent) => { setIsEditModalOpen(false); if (updatedEvent && onEventUpdate) onEventUpdate(updatedEvent) }} />
            </div>
          </DialogContent>
        </Dialog>

    </div >
  )
}

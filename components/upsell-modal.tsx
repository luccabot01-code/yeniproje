"use client"

import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ShoppingBag, Star, Sparkles, Lock, CheckCircle } from "lucide-react"

const ETSY_URL =
  "https://www.etsy.com/listing/4438550779/all-in-one-event-management-system"

interface UpsellModalProps {
  open: boolean
  onClose: () => void
}

export function UpsellModal({ open, onClose }: UpsellModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (open) document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, onClose])

  // Lock scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
          onClick={(e) => {
            if (e.target === overlayRef.current) onClose()
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-[0_40px_100px_-12px_rgba(0,0,0,0.6)] bg-background border border-border"
          >
            {/* Top accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-foreground/60 via-foreground to-foreground/60" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 flex items-center justify-center w-8 h-8 rounded-2xl bg-muted/80 hover:bg-foreground border border-border/50 hover:border-foreground transition-all duration-200 hover:scale-110 active:scale-95 group"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5 text-foreground/60 group-hover:text-background transition-colors" />
            </button>

            {/* Hero section */}
            <div className="relative px-8 pt-8 pb-6 text-center">
              {/* Icon */}
              <div className="flex items-center justify-center mb-5">
                <div className="relative">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-foreground text-background shadow-xl">
                    <Lock className="h-7 w-7" />
                  </div>
                  <div className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-6 h-6 rounded-full bg-background border-2 border-foreground">
                    <Sparkles className="h-3 w-3 text-foreground" />
                  </div>
                </div>
              </div>

              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-foreground/8 border border-border text-xs font-medium text-muted-foreground mb-3 tracking-wide uppercase">
                <Star className="h-3 w-3 fill-current" />
                Live Demo
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2 leading-tight">
                  You're viewing a demo
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  This is a preview of the wedding planning tool. Get your own copy to manage your real event.
                </p>
            </div>

            {/* Features list */}
            <div className="px-8 pb-6">
              <div className="space-y-2.5">
                  {[
                    "Create and manage your own event",
                    "Track RSVPs in real time",
                    "Budget tracker & wedding checklist",
                    "Seating chart with drag & drop",
                    "QR code for guests & guest list export",
                    "Everything set up and ready to use",
                  ].map((feature) => (
                  <div key={feature} className="flex items-start gap-2.5">
                    <CheckCircle className="h-4 w-4 text-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground/80">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="px-8 pb-8 space-y-3">
              <a
                href={ETSY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-center gap-2.5 w-full h-12 px-6 rounded-2xl bg-foreground text-background font-semibold text-sm tracking-wide shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
              >
                {/* Shimmer */}
                <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                <ShoppingBag className="h-4 w-4 relative" />
                <span className="relative">Get the Full Version</span>
              </a>
              <button
                onClick={onClose}
                className="w-full h-10 rounded-2xl border border-border bg-transparent text-sm text-muted-foreground hover:bg-muted transition-colors duration-200"
              >
                Continue Exploring Demo
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

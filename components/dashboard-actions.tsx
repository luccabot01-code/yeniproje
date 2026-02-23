"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Download, Check, LinkIcon, QrCode, ExternalLink } from "lucide-react"
import { QRCodeGenerator } from "@/components/qr-code-generator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import type { Event, RSVP } from "@/lib/types"
import { motion } from "framer-motion"

interface DashboardActionsProps {
  event: Event
  rsvps: RSVP[]
}

export function DashboardActions({ event, rsvps }: DashboardActionsProps) {
  const [copied, setCopied] = useState(false)
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const inviteUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/rsvp/${event.slug}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("[v0] Failed to copy:", err)
    }
  }

  const handleExportCSV = () => {
    const validRsvps = rsvps.filter(
      (rsvp) => rsvp.attendance_status === "attending" || rsvp.attendance_status === "not_attending",
    )

    const headers = ["Name", "Status", "Guests", "Contact", "Message", "Submitted At"]
    const rows = validRsvps.map((rsvp) => [
      rsvp.guest_name,
      rsvp.attendance_status === "attending" ? "Attending" : "Not Attending",
      rsvp.number_of_guests,
      [rsvp.guest_email, rsvp.guest_phone].filter(Boolean).join(" | ") || "N/A",
      rsvp.message || "",
      new Date(rsvp.created_at).toLocaleString(),
    ])

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))].join("\n")

    const link = document.createElement("a")
    link.setAttribute("href", encodeURI(csvContent))
    link.setAttribute("download", `${event.slug}-rsvps.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const validRsvpCount = rsvps.filter(
    (rsvp) => rsvp.attendance_status === "attending" || rsvp.attendance_status === "not_attending",
  ).length

  const buttonVariants = {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    hover: { x: 4 },
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="glass-card shadow-soft hover:shadow-soft-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Actions</CardTitle>
              <CardDescription className="text-xs">Manage your wedding</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {/* Open Invitation Link Button */}
            <motion.div
              variants={buttonVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
              transition={{ delay: 0.05 }}
            >
              <Button
                onClick={() => window.open(inviteUrl, "_blank")}
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 h-auto py-2.5 px-3 glass hover:bg-primary/5 transition-all duration-300 bg-transparent"
              >
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 text-left text-sm">Open Invitation Link</span>
              </Button>
            </motion.div>

            {/* Copy Link Button */}
            <motion.div
              variants={buttonVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
              transition={{ delay: 0.1 }}
            >
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 h-auto py-2.5 px-3 glass hover:bg-primary/5 transition-all duration-300 bg-transparent"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="flex-1 text-left text-sm">{copied ? "Link Copied!" : "Copy Invitation Link"}</span>
                {!copied && <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
              </Button>
            </motion.div>

            {/* QR Code Button */}
            <motion.div
              variants={buttonVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
              transition={{ delay: 0.15 }}
            >
              <Button
                onClick={() => setQrDialogOpen(true)}
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 h-auto py-2.5 px-3 glass hover:bg-primary/5 transition-all duration-300 bg-transparent"
              >
                <QrCode className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">View QR Code</span>
              </Button>
            </motion.div>

            {/* Export Button */}
            <motion.div
              variants={buttonVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
              transition={{ delay: 0.2 }}
            >
              <Button
                onClick={handleExportCSV}
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 py-2.5 px-3 glass hover:bg-primary/5 transition-all duration-300 bg-transparent"
                disabled={validRsvpCount === 0}
              >
                <Download className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Export Guest List</span>
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* QR Code Dialog */}
        <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
            <DialogContent
                className="sm:max-w-sm p-0 gap-0 overflow-hidden border-0 shadow-[0_32px_80px_-12px_rgba(0,0,0,0.35)] rounded-3xl bg-background"
                overlayClassName="bg-black/50 backdrop-blur-sm"
                showCloseButton={false}
              >
          <DialogTitle className="sr-only">QR Code</DialogTitle>
            <DialogDescription className="sr-only">Scan this QR code to access your wedding invitation link.</DialogDescription>

          {/* Top decorative band */}
          <div className="relative h-2 w-full bg-gradient-to-r from-foreground/80 via-foreground/40 to-foreground/80" />

              {/* Close button */}
              <DialogClose asChild>
                <button
                  className="absolute top-4 right-4 z-50 group flex items-center justify-center w-9 h-9 rounded-2xl bg-muted/70 hover:bg-foreground border border-border/50 hover:border-foreground backdrop-blur-sm transition-all duration-200 hover:scale-110 active:scale-95 touch-manipulation"
                  aria-label="Close"
                >
                  <svg className="h-4 w-4 text-foreground/60 group-hover:text-background transition-colors duration-200 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </DialogClose>

                <div>
                <div className="px-6 pt-8 pb-4">
                    {/* Icon + title */}
                  <motion.div
                    className="flex flex-col items-center text-center gap-3 mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-foreground text-background shadow-lg">
                  <QrCode className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">QR Code</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">Share your wedding with a simple scan</p>
                </div>
              </motion.div>

              {/* QR frame */}
              <motion.div
                className="relative flex justify-center"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Outer ring */}
                  <div className="w-full p-2 rounded-2xl border border-border/50 bg-gradient-to-br from-muted/60 to-muted/20 shadow-inner">
                    {/* Inner white area */}
                    <div className="rounded-xl overflow-hidden bg-white p-2 shadow-sm w-full">
                      <QRCodeGenerator url={inviteUrl} title={event.title} compact />
                    </div>
                  </div>
                {/* Corner accents */}
                <div className="pointer-events-none absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-foreground/40 rounded-tl-xl" />
                <div className="pointer-events-none absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-foreground/40 rounded-tr-xl" />
                <div className="pointer-events-none absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-foreground/40 rounded-bl-xl" />
                <div className="pointer-events-none absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-foreground/40 rounded-br-xl" />
              </motion.div>


          </div>

          {/* Download section */}
          <motion.div
            className="px-6 py-5 border-t border-border/50 space-y-2.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            {/* JPG button */}
            <div>
              <button
                onClick={() => {
                  const canvas = document.querySelector("canvas") as HTMLCanvasElement
                  if (!canvas) return
                  const link = document.createElement("a")
                  link.download = `${event.title.toLowerCase().replace(/\s+/g, "-")}-qr-code.jpg`
                  link.href = canvas.toDataURL("image/jpeg", 0.95)
                  link.click()
                }}
                className="group w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-border/60 bg-muted/30 hover:bg-foreground hover:border-foreground transition-all duration-200 active:scale-[0.98] touch-manipulation"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-background border border-border/50 group-hover:bg-background/20 transition-colors">
                  <svg className="w-4 h-4 text-foreground/70 group-hover:text-background transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-foreground group-hover:text-background transition-colors">Download QR Code (JPG)</p>
                    <p className="text-[11px] text-muted-foreground group-hover:text-background/70 transition-colors">Share via WhatsApp, Telegram or email</p>
                </div>
              </button>
            </div>

              {/* SVG button */}
              <div>
                <button
                  onClick={() => {
                    const canvas = document.querySelector("canvas") as HTMLCanvasElement
                    if (!canvas) return
                    const size = 240
                    const imgData = canvas.toDataURL("image/png")
                    const svg = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><image width="${size}" height="${size}" xlink:href="${imgData}"/></svg>`
                    const blob = new Blob([svg], { type: "image/svg+xml" })
                    const url = URL.createObjectURL(blob)
                    const link = document.createElement("a")
                    link.download = `${event.title.toLowerCase().replace(/\s+/g, "-")}-qr-code.svg`
                    link.href = url
                    link.click()
                    URL.revokeObjectURL(url)
                  }}
                  className="group w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-border/60 bg-muted/30 hover:bg-foreground hover:border-foreground transition-all duration-200 active:scale-[0.98] touch-manipulation"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-background border border-border/50 group-hover:bg-background/20 transition-colors">
                    <svg className="w-4 h-4 text-foreground/70 group-hover:text-background transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-foreground group-hover:text-background transition-colors">Editable QR Code (SVG)</p>
                      <p className="text-[11px] text-muted-foreground group-hover:text-background/70 transition-colors">Import into Canva and match your invitation's color scheme</p>
                  </div>
                </button>
              </div>
            </motion.div>
            </div>
          </DialogContent>
      </Dialog>
    </>
  )
}

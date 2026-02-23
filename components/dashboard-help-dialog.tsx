"use client"

import {
  HelpCircle, X, LayoutDashboard, Settings2, UtensilsCrossed,
  Bus, Armchair, Wallet, CheckSquare, Trash2, MessageSquare,
  Pencil, Download, Mail, ExternalLink, Sparkles
} from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { motion } from "framer-motion"

interface DashboardHelpDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

// ─── SECTION DATA ──────────────────────────────────────────────────────────────

const sections = [
  {
    id: "s1",
    icon: LayoutDashboard,
    number: "01",
    title: "Overview & Quick Actions",
    content: [
      {
        heading: "Live Statistic Cards",
        body: "The four cards at the top of the Overview tab update in real time via a Supabase WebSocket subscription. Total RSVPs counts every form submission. Attending shows confirmed guests only. Not Attending tracks declines. Total Guests sums all party members across every attending RSVP — including +1s and children. No refresh is ever needed; the moment a guest submits, the numbers change on your screen.",
      },
      {
        heading: "Guest Responses Table",
        body: "Every RSVP submission appears as a row with: guest name, attendance status badge, party size, contact details (email / phone if provided), submission timestamp, and any personal message left for the couple. If a guest wrote a note, a message icon (💬) appears on their row — click it to read the full text in a popup. The trash icon (🗑️) on the far right permanently deletes that RSVP entry from the database. This action cannot be undone.",
      },
      {
        heading: "Quick Actions Panel",
        body: "Located in the right sidebar on the Overview tab. \"Copy Invitation Link\" copies your permanent RSVP URL to the clipboard — this is the link you share with guests. \"Open Invitation\" launches it in a new browser tab so you can preview exactly what your guests see. \"View QR Code\" opens the QR code download modal. \"Export Guest List\" downloads every RSVP submission as a CSV file (the button is disabled if no responses have been received yet).",
      },
      {
        heading: "QR Code Modal — PNG vs SVG",
        body: "Your QR code is available in two formats. PNG/JPG is a raster image — ideal for digital sharing (WhatsApp, social media) or printing at standard sizes. SVG is a lossless vector file that stays perfectly sharp at any size. Choose SVG for printed stationery, invitations, or signage. Both formats produce a fully scannable code with no smartphone app required — it opens directly in the guest's browser.",
      },
      {
        heading: "The Canva SVG Recolor Trick",
        body: "Download the QR code as an SVG. In Canva, click \"Upload\" → \"Upload files\" and import the SVG. Once placed on your canvas, click the QR code element, then use Canva's color picker to change the foreground to any exact hex value — your invitation's accent color, a floral blush, or a stationery gold. Because SVG is a mathematical vector format, the recolor does not degrade scan quality in any way. This is the recommended approach for high-end printed wedding stationery.",
      },
    ],
  },
  {
    id: "s2",
    icon: Settings2,
    number: "02",
    title: "Top Bar Controls — Customization & Editing",
    content: [
      {
        heading: "Edit Wedding",
        body: "Click \"Edit Wedding\" in the top bar to open a full editing modal. You can change the wedding title, date & time, venue, location URL, dress code, program notes, gift registry URL, cover photo or video, itinerary timeline, Our Story cards, and the countdown timer — all without disrupting anything. Your RSVP link and QR code are permanent identifiers tied to your account, not to any content field. No matter how many times you edit, the link guests already have will always work.",
      },
      {
        heading: "Theme RSVP",
        body: "Click \"Theme RSVP\" to open the theme selector. Choose from nine ready-made themes: Default (Modern), Minimalist, Rustic, Floral, Ocean, Vintage, Lavender, Emerald, and Midnight. The selected theme instantly updates the color scheme, typography tones, and background of the public invitation page. At the bottom of the dropdown is an \"Apply to Dashboard\" toggle — when enabled, the same color palette is applied to your entire admin panel too. Toggling it off always returns the dashboard to the default appearance.",
      },
      {
        heading: "Sun / Moon Icon — Light & Dark Mode",
        body: "The sun/moon toggle in the top bar switches your dashboard between Light and Dark mode. This is a personal display preference that affects only your screen — it has no effect on how the invitation page appears to guests. The transition uses the browser's View Transition API for a silky-smooth animated blend rather than an abrupt flash.",
      },
      {
        heading: "Refresh",
        body: "The Refresh button reloads all RSVP data from the database. Because the platform uses real-time Supabase subscriptions, new RSVPs arrive automatically without any manual action. The Refresh button is a safety net for edge cases where a connection hiccup may have caused a brief delay.",
      },
    ],
  },
  {
    id: "s3",
    icon: UtensilsCrossed,
    number: "03",
    title: "Guest List & Catering — The Kitchen Hub",
    content: [
      {
        heading: "Summary Cards",
        body: "At the top of the Guest List & Catering tab, four cards give your caterer an instant snapshot: Total Covers (the total number of individual attendees, split by adults and children), Meals Selected (how many people have already chosen a dish), Pending Selections (how many still haven't), and Dietary Notes (the count of guests with special dietary requirements). All four update live as RSVPs arrive.",
      },
      {
        heading: "Catering Overview — Dynamic Progress Bars",
        body: "Below the summary cards, the Catering Overview section renders a visual breakdown of every menu option you created. Each dish appears as a labeled progress bar showing the exact count and its percentage of total covers. If you added three menu options and 45 out of 100 guests chose the salmon, that bar fills to 45% in real time. This section only appears if you have configured custom menu options in the Edit Wedding form.",
      },
      {
        heading: "Per-Guest Meal Table",
        body: "The full table lists every individual attendee — the primary guest and each member of their accompanying party — with their name, role (Primary / Guest), age group (Adult / Child), child age range where applicable (0–3 or 3–12 years), meal selection, and any dietary notes they entered. Use the search bar to filter instantly by name or by dish. This table is designed to be handed directly to your caterer or venue coordinator.",
      },
      {
        heading: "Export for Caterer (CSV)",
        body: "Click \"Export for Caterer (CSV)\" to download the complete per-guest catering data as a spreadsheet. The CSV includes every column from the table — names, roles, age groups, meal choices, and dietary notes — formatted for direct use in Excel, Numbers, or a venue management system. Send this file to your caterer the week before the wedding for accurate headcount and meal preparation.",
      },
    ],
  },
  {
    id: "s4",
    icon: Bus,
    number: "04",
    title: "Logistics — Travel, Lodging & Song Requests",
    content: [
      {
        heading: "Travel & Lodging Tab",
        body: "This tab aggregates shuttle and hotel data automatically from every RSVP form. The Shuttle Seats Needed card sums the total headcount across all parties that requested shuttle service — giving you the exact number of seats to book with your transfer company. The Hotel Rooms Estimated card counts the parties that indicated they have booked or plan to book accommodation in your hotel block. The full table below lists every guest's transport and lodging status and supports real-time filtering.",
      },
      {
        heading: "Export Logistics (CSV)",
        body: "Click \"Export Logistics (CSV)\" to download the travel and accommodation table as a spreadsheet. Share this file with your shuttle provider for seat allocation or with your hotel block coordinator for room confirmation follow-ups.",
      },
      {
        heading: "Song Requests Tab",
        body: "Every song submitted through the RSVP form lands here with the guest's name and their requested song. A counter at the top shows the total number of requests received. Use the search bar to filter by guest name or song title to quickly spot duplicates or must-plays. The list is ordered by submission time so you can see the most recent requests at a glance.",
      },
      {
        heading: "Export for DJ (CSV)",
        body: "Click \"Export for DJ (CSV)\" to download the complete song request list as a spreadsheet. Hand this file to your DJ or live band before the reception. It includes every submission in one clean document, ready to import into any music management software or simply print out.",
      },
    ],
  },
  {
    id: "s5",
    icon: Armchair,
    number: "05",
    title: "The Drag-and-Drop Seating Chart",
    content: [
      {
        heading: "Adding a Table",
        body: "In the Seating Chart tab, click \"Add New Table\" to create a new table. Give it a descriptive name (e.g. \"Bride's Family\", \"College Friends\", \"Table 4\"), an optional category label, and a maximum seating capacity. The table appears immediately on the canvas with a live seat counter showing how many spots are available.",
      },
      {
        heading: "Assigning Guests",
        body: "All attending guests automatically populate the \"Unseated Guests\" sidebar on the left. Simply drag a guest's name from the sidebar and drop it onto any table card — or click the guest's name while a table is selected to assign them. The table's seat counter updates instantly. You can reassign guests between tables at any time by dragging them from one table to another.",
      },
      {
        heading: "Deleting a Table",
        body: "To remove a table, click the delete icon on the table card. Any guests who were seated at that table are automatically and safely returned to the Unseated Guests sidebar — no data is lost. This allows you to restructure your seating plan freely without worrying about losing guest assignments.",
      },
      {
        heading: "Cloud-Backed Storage",
        body: "Unlike the Budget and Checklist tabs (which use local browser storage), your seating chart data is saved directly to Supabase. This means your seating plan is accessible from any device where you log into your dashboard — your phone, a venue coordinator's laptop, or a second computer. Changes sync the moment they are made.",
      },
    ],
  },
  {
    id: "s6",
    icon: Wallet,
    number: "06",
    title: "Budget & Planning Checklist — Local Storage",
    content: [
      {
        heading: "Important: Data Lives in Your Browser",
        body: "The Budget & Expenses and Planning Checklist tabs store all their data in your browser's localStorage — not in the cloud database. This design choice prioritizes privacy and speed: your financial details and task list never leave your device. However, this means you will not see this data if you log into your dashboard from a different browser or device. RSVPs, meal selections, and seating chart data are all cloud-synced; only the Budget and Checklist are local. Keep this in mind if you switch computers.",
      },
      {
        heading: "Setting Your Budget & Recording Expenses",
        body: "In the Budget & Expenses tab, click the pencil icon on the Total Budget card to set your target budget. Click \"Record Expense\" to add a line item — each expense has a category (Venue, Catering, Photography, etc.), estimated and actual cost, payment status, responsible party, and an optional vendor or contract URL. A donut chart visualizes spending by category, and the progress bar turns yellow when you exceed 80% of budget and red above 100%.",
      },
      {
        heading: "Planning Checklist",
        body: "Tasks are organized into five time-frame categories: 12+ Months Out, 6–9 Months Out, 3 Months Out, The Final Month, and Post-Wedding. A circular progress ring at the top shows your overall completion percentage. Click the circle icon on any task to mark it complete (it will appear with a strikethrough). Click \"Add Task\" to create a custom task in any category. Hover a task to reveal the trash icon and delete it.",
      },
      {
        heading: "Export CSV (Budget)",
        body: "Click \"Export CSV\" in the Budget & Expenses tab to download your full financial ledger as a spreadsheet. The export includes every expense item with all its fields — estimated cost, actual cost, variance, payment status, and responsible party. This file is suitable for sharing with a financial planner, accountant, or your partner.",
      },
    ],
  },
  {
    id: "s7",
    icon: Trash2,
    number: "07",
    title: "Button Glossary — What Does This Do?",
    content: [
      {
        heading: "Quick Reference for Every Icon",
        body: "A concise reference for the action icons you will encounter throughout the dashboard.",
      },
      {
        heading: "🗑️  Trash Icon",
        body: "Permanently deletes the associated item. This applies to: a Guest RSVP (Overview tab), an Expense entry (Budget tab), a Checklist task (Planning tab), and a Seating Table (Seating Chart tab). Deletion is immediate and cannot be undone, so use it deliberately.",
      },
      {
        heading: "💬  Message Icon",
        body: "Appears on Guest RSVP rows in the Overview table when the guest left a personal note during the RSVP process. Click it to open a popup displaying the full message text.",
      },
      {
        heading: "✏️  Pencil Icon",
        body: "Opens an inline edit mode for a specific field. Currently used on the Budget Target card to set or update your total wedding budget. Click the pencil, type the new value, and confirm.",
      },
      {
        heading: "⬇️  Export CSV",
        body: "Downloads the current tab's data table as a comma-separated values (.csv) file compatible with Excel, Google Sheets, and Numbers. Available in: Guest List & Catering (\"Export for Caterer\"), Song Requests (\"Export for DJ\"), Travel & Lodging (\"Export Logistics\"), and Budget & Expenses (\"Export CSV\").",
      },
    ],
  },
]

// ─── COMPONENT ─────────────────────────────────────────────────────────────────

export function DashboardHelpDialog({ open, onOpenChange }: DashboardHelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[95vw] md:max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 bg-background border border-border shadow-2xl rounded-2xl [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-foreground/35 [scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.2)_transparent] dark:[scrollbar-color:rgba(255,255,255,0.2)_transparent]"
        overlayClassName="bg-black/60 backdrop-blur-sm"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Dashboard Help — Cockpit Manual</DialogTitle>

        {/* ── Header ── */}
        <motion.div
          className="relative px-8 py-10 md:px-12 md:py-12 bg-foreground text-background overflow-hidden"
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Dot grid texture */}
          <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle,_rgba(255,255,255,0.8)_1px,_transparent_1px)] bg-[length:22px_22px]" />
          {/* Glowing orb */}
          <div className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 rounded-full bg-white/5 blur-3xl" />

          {/* Close button */}
          <motion.button
            onClick={() => onOpenChange?.(false)}
            className="absolute top-5 right-5 p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 z-50 cursor-pointer"
            aria-label="Close"
            whileHover={{ rotate: 90, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.25 }}
          >
            <X className="h-4 w-4" />
          </motion.button>

          <div className="relative z-10">
            {/* Icon badge */}
            <motion.div
              className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 border border-white/15 mb-5"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 240, damping: 16 }}
            >
              <HelpCircle className="h-6 w-6" />
            </motion.div>

            <motion.h1
              className="text-2xl md:text-3xl font-bold tracking-tight mb-2"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.38, delay: 0.18 }}
            >
              Dashboard Help
            </motion.h1>

            <motion.p
              className="text-background/65 text-sm md:text-base leading-relaxed max-w-lg"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.38, delay: 0.28 }}
            >
              Your cockpit manual — every tab, button, and feature explained so you can run your wedding command center with confidence.
            </motion.p>
          </div>
        </motion.div>

        {/* ── Accordion Body ── */}
        <motion.div
          className="px-5 md:px-8 pt-6 pb-4 bg-background"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.32, ease: "easeOut" }}
        >
          <Accordion type="multiple" className="space-y-2">
            {sections.map((section, i) => {
              const Icon = section.icon
              return (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: 0.35 + i * 0.04 }}
                >
                  <AccordionItem
                    value={section.id}
                    className="border border-border rounded-xl overflow-hidden last:border-b"
                  >
                    <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/40 transition-colors [&[data-state=open]]:bg-muted/30">
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        {/* Number badge */}
                        <span className="flex-shrink-0 text-[10px] font-bold text-muted-foreground tracking-widest w-6 text-right">
                          {section.number}
                        </span>
                        {/* Icon */}
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-foreground flex items-center justify-center shadow-sm">
                          <Icon className="h-3.5 w-3.5 text-background" />
                        </div>
                        {/* Title */}
                        <span className="text-sm font-semibold text-foreground tracking-tight truncate">
                          {section.title}
                        </span>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="px-5 pb-5 pt-1">
                      <div className="space-y-5 pl-[3.75rem]">
                        {section.content.map((block, j) => (
                          <div key={j} className="space-y-1.5">
                            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                              {block.heading}
                            </h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {block.body}
                            </p>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              )
            })}
          </Accordion>
        </motion.div>

        {/* ── Tips Strip ── */}
        <motion.div
          className="mx-5 md:mx-8 mb-4 rounded-xl border border-border bg-muted/30 px-5 py-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 0.65 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-foreground" />
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Tips Worth Knowing</span>
          </div>
          <ul className="space-y-2.5">
            {[
              { label: "Budget & Checklist are local.", body: "These tabs use localStorage — your data is private and instant, but only available on the browser/device you used to create it. RSVPs and seating are in the cloud." },
              { label: "Seating chart is cloud-backed.", body: "Unlike Budget and Checklist, seating assignments sync to Supabase and are accessible from any device you log into." },
              { label: "Editing never breaks your link.", body: "You can rewrite every field, swap the cover video, and change themes freely. Your RSVP link and QR code are permanent — guests never need a new link." },
              { label: "Canva SVG trick.", body: "Download the QR code as SVG and import into Canva to recolor it to your exact palette. Scan quality is fully preserved in vector format." },
              { label: "Real-time, always.", body: "Supabase WebSocket subscriptions push RSVPs to your dashboard the instant a guest submits. Stats, tables, and catering data all update without a refresh." },
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs leading-relaxed text-muted-foreground">
                <div className="w-1 h-1 rounded-full bg-foreground/50 mt-[5px] flex-shrink-0" />
                <span>
                  <span className="font-semibold text-foreground">{tip.label} </span>
                  {tip.body}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* ── Footer — always visible ── */}
        <motion.div
          className="mx-5 md:mx-8 mb-6 rounded-xl border border-dashed border-border bg-background p-5"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 0.72 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Mail className="h-3.5 w-3.5 text-foreground" />
            <p className="text-sm font-semibold text-foreground">Need help or have a feature request?</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-24 flex-shrink-0">Contact Support</span>
              <a
                href="mailto:sahinturkzehra@gmail.com"
                className="text-xs text-foreground font-medium hover:underline underline-offset-2 transition-all"
              >
                sahinturkzehra@gmail.com
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-24 flex-shrink-0">Visit our shop</span>
              <a
                href="https://www.etsy.com/shop/FlorMontana"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-foreground font-medium hover:underline underline-offset-2 transition-all"
              >
                etsy.com/shop/FlorMontana
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}

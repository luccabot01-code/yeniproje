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

const sections = [
  {
    id: "s1",
    icon: LayoutDashboard,
    number: "01",
    title: "Overview & Quick Actions",
    content: [
      {
        heading: "The four summary cards",
        body: "At the top of the Overview tab you'll see four live numbers: Total RSVPs (how many people have filled in the form), Attending (those who said yes), Not Attending (those who said no), and Total Guests (the real headcount — every person in every group, including partners and children). These update the moment someone submits the form. No refreshing needed.",
      },
      {
        heading: "Reading the Guest Responses table",
        body: "Every submission appears as a row. You can see the guest's name, whether they're coming, how many people are in their group, their contact details, and when they submitted. If a guest left you a personal note, a small message icon appears on their row — click it to read the full message in a pop-up window.",
      },
      {
        heading: "Removing a response",
        body: "See the small trash icon on the far right of any guest row? Clicking it permanently removes that person's RSVP. Use it if someone submitted by mistake or if you need to clear a test entry. This cannot be undone.",
      },
      {
        heading: "Quick Actions panel",
        body: "On the right side of the Overview tab you'll find four shortcuts: \"Copy Invitation Link\" copies your permanent RSVP link to paste anywhere. \"Open Invitation\" opens a preview of exactly what your guests see. \"View QR Code\" opens the download window for your QR code. \"Export Guest List\" downloads all responses as a spreadsheet — handy if you want to print a list or share it with your coordinator.",
      },
      {
        heading: "QR Code — PNG or SVG?",
        body: "PNG is a standard image file — perfect for sharing on WhatsApp, Instagram, or printing at normal sizes. SVG is a special format that stays perfectly sharp no matter how large you print it, making it ideal for printed wedding stationery and table signage. Both work equally well for scanning — guests just point their phone camera at it.",
      },
      {
        heading: "Recoloring the QR code in Canva",
        body: "Download the QR code as an SVG. In Canva, click \"Uploads\" then \"Upload files\" and bring the SVG in. Place it on your canvas, click on it, and use the color picker to change the QR code color to match your invitation — any shade of blush, gold, sage, or navy you like. Because of the SVG format, the color change doesn't affect how well it scans at all. This is the easiest way to get a perfectly on-brand QR code for printed invitations.",
      },
    ],
  },
  {
    id: "s2",
    icon: Settings2,
    number: "02",
    title: "Top Bar — Editing & Display Options",
    content: [
      {
        heading: "Edit Wedding",
        body: "Click \"Edit Wedding\" in the top bar to update any detail about your wedding — the title, date and time, venue, cover photo or video, dress code, program, gift registry, timeline, and your Our Story cards. You can change anything here as many times as you like. Your RSVP link and QR code stay exactly the same — guests don't need a new link, ever.",
      },
      {
        heading: "Theme RSVP",
        body: "Click \"Theme RSVP\" to choose from nine ready-made colour themes: Default, Minimalist, Rustic, Floral, Ocean, Vintage, Lavender, Emerald, and Midnight. Selecting a theme updates the look of your public invitation page instantly. At the bottom of the theme panel there's an \"Apply to Dashboard\" toggle — turn it on and the same color palette is applied to your dashboard too. Turn it off to go back to the default look.",
      },
      {
        heading: "Sun / Moon icon — Light & Dark mode",
        body: "This toggle in the top bar switches your dashboard between a light and dark background. It only affects what you see on your screen — your guests always see the invitation in the theme you've chosen for them. Pick whichever you find easier on the eyes.",
      },
      {
        heading: "Refresh button",
        body: "Tapping Refresh reloads your latest guest data from scratch. New RSVPs normally appear on their own without you doing anything, but if you ever feel the numbers look out of date, a quick refresh will bring everything up to the moment.",
      },
    ],
  },
  {
    id: "s3",
    icon: UtensilsCrossed,
    number: "03",
    title: "Guest List & Catering",
    content: [
      {
        heading: "Summary cards",
        body: "At the top of this tab, four cards give you and your caterer an at-a-glance count: total individual attendees (split by adults and children), how many have already chosen a meal, how many still haven't, and how many guests have a dietary note. All four update as new RSVPs come in.",
      },
      {
        heading: "Catering Overview — the meal bars",
        body: "Below the cards, each dish you created appears as a labeled bar showing how many people chose it and what percentage of your total guests that represents. If 45 out of 100 guests picked the salmon, that bar shows 45%. The bars adjust automatically every time a new guest responds. This section only appears if you've added menu options in your wedding settings.",
      },
      {
        heading: "The full guest meal table",
        body: "Every individual attendee is listed here — including all members of group RSVPs — with their name, whether they're the main guest or part of a group, their age group (adult or child), meal choice, and any dietary notes. Use the search bar to find a specific person or filter by dish name. This table is designed to hand directly to your caterer.",
      },
      {
        heading: "Export for Caterer",
        body: "Click \"Export for Caterer\" to download a spreadsheet with every guest's name, meal choice, age group, and dietary notes. Send this file to your venue or catering team before the wedding. It has everything they need to prepare the right number of each dish.",
      },
    ],
  },
  {
    id: "s4",
    icon: Bus,
    number: "04",
    title: "Travel, Lodging & Song Requests",
    content: [
      {
        heading: "Travel & Lodging tab",
        body: "This tab collects shuttle and hotel information from every RSVP automatically. The \"Shuttle Seats Needed\" card shows exactly how many seats to arrange with your transport company. The \"Hotel Rooms\" card counts how many groups plan to book accommodation. The full table below lists each guest's transport and lodging needs.",
      },
      {
        heading: "Export Logistics",
        body: "Click \"Export Logistics\" to download the travel and lodging table as a spreadsheet. Share it with your shuttle provider so they know how many seats to prepare, or with your hotel contact for room block follow-ups.",
      },
      {
        heading: "Song Requests tab",
        body: "Every song your guests requested through the RSVP form shows up here — with the guest's name and their song. A counter at the top shows the total number of requests. Search by guest name or song title to spot any must-plays or duplicates quickly.",
      },
      {
        heading: "Export for DJ",
        body: "Click \"Export for DJ\" to download the complete song request list as a spreadsheet. Hand it to your DJ or live band before the reception. It's one clean file with every submission, ready to print out or share directly.",
      },
    ],
  },
  {
    id: "s5",
    icon: Armchair,
    number: "05",
    title: "Seating Chart",
    content: [
      {
        heading: "Adding a table",
        body: "In the Seating Chart tab, click \"Add New Table\". Give the table a name — something like \"Bride's Family\", \"College Friends\", or simply \"Table 3\" — and enter how many seats it has. The table appears straight away on the canvas with a running count of available spots.",
      },
      {
        heading: "Seating your guests",
        body: "All guests who said they're coming appear in the \"Unseated Guests\" list on the left side. Drag a name from that list and drop it onto any table to assign them a seat. The seat counter updates immediately. You can move guests between tables at any time — just drag them from one table to another.",
      },
      {
        heading: "Deleting a table",
        body: "Click the delete icon on any table card to remove it. Any guests who were seated there are automatically moved back to the Unseated Guests list — nothing is lost. This makes it easy to reorganise your seating plan as your guest list changes.",
      },
      {
        heading: "Your seating plan is saved online",
        body: "Unlike the Budget and To-Do list, your seating chart is saved to the cloud. This means you can open your dashboard on your phone, your partner's laptop, or even a tablet at the venue and see the same up-to-date plan. Changes save as soon as you make them.",
      },
    ],
  },
  {
    id: "s6",
    icon: Wallet,
    number: "06",
    title: "Budget & Planning Checklist",
    content: [
      {
        heading: "Important: these tabs are saved on this device only",
        body: "Your Budget and To-Do List data is saved in your current browser — not online. This means your financial details stay completely private and load instantly. However, if you open your dashboard on a different phone, computer, or browser, you won't see this data there. Your RSVPs, meal selections, and seating chart are all saved online and work everywhere — only the Budget and Checklist are device-specific. Keep this in mind if you plan to switch computers.",
      },
      {
        heading: "Setting your budget & adding expenses",
        body: "In the Budget tab, click the pencil icon on the Total Budget card to enter your overall wedding budget. Then click \"Add Expense\" to log individual costs — venue, flowers, catering, photographer, and so on. For each item you can record the amount you expect to pay and the amount you actually paid. A chart breaks down your spending by category, and a progress bar turns yellow as you approach your limit.",
      },
      {
        heading: "Planning checklist",
        body: "Your to-do list is grouped into five time windows: 12+ Months Out, 6–9 Months Out, 3 Months Out, The Final Month, and Post-Wedding. A circular progress ring at the top shows how much you've completed. Tick tasks off as you go, add your own custom tasks, or delete anything that doesn't apply to your wedding.",
      },
      {
        heading: "Export Budget",
        body: "Click \"Export CSV\" in the Budget tab to download your full expense list as a spreadsheet. It includes every line item — what you budgeted, what you actually spent, the difference, and payment status. Useful to share with a planner, accountant, or simply keep as a record.",
      },
    ],
  },
  {
    id: "s7",
    icon: Trash2,
    number: "07",
    title: "Icon Reference — What Does This Button Do?",
    content: [
      {
        heading: "Quick guide to the action icons",
        body: "Here's a plain-English explanation of the small icons you'll see throughout the dashboard.",
      },
      {
        heading: "🗑️  Trash icon",
        body: "Permanently deletes the item it sits next to. This applies to a guest RSVP on the Overview tab, an expense entry on the Budget tab, a task on the Checklist, and a table on the Seating Chart. Deletion cannot be undone, so use it with care.",
      },
      {
        heading: "💬  Message icon",
        body: "Appears on a guest's row in the RSVP table when they left a personal note for you during the form. Click it to read their full message in a small pop-up.",
      },
      {
        heading: "✏️  Pencil icon",
        body: "Opens an edit field so you can update a specific value. Used on the Total Budget card to set or change your overall budget target. Click the pencil, type the new amount, and confirm.",
      },
      {
        heading: "⬇️  Export / Download button",
        body: "Downloads the current tab's data as a spreadsheet file you can open in Excel, Google Sheets, or Numbers. You'll find this in: Guest List & Catering (\"Export for Caterer\"), Song Requests (\"Export for DJ\"), Travel & Lodging (\"Export Logistics\"), and Budget (\"Export CSV\").",
      },
    ],
  },
]

export function DashboardHelpDialog({ open, onOpenChange }: DashboardHelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[95vw] md:max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 bg-background border border-border shadow-2xl rounded-2xl [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-foreground/35 [scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.2)_transparent] dark:[scrollbar-color:rgba(255,255,255,0.2)_transparent]"
        overlayClassName="bg-black/60 backdrop-blur-sm"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Dashboard Help — Your Control Panel Guide</DialogTitle>

        {/* ── Header ── */}
        <motion.div
          className="relative px-8 py-10 md:px-12 md:py-12 bg-foreground text-background overflow-hidden"
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle,_rgba(255,255,255,0.8)_1px,_transparent_1px)] bg-[length:22px_22px]" />
          <div className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 rounded-full bg-white/5 blur-3xl" />

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
              A plain-English guide to every tab and button in your dashboard — so you can manage your wedding day with confidence.
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
                        <span className="flex-shrink-0 text-[10px] font-bold text-muted-foreground tracking-widest w-6 text-right">
                          {section.number}
                        </span>
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-foreground flex items-center justify-center shadow-sm">
                          <Icon className="h-3.5 w-3.5 text-background" />
                        </div>
                        <span className="text-sm font-semibold text-foreground tracking-tight leading-snug">
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
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Good to Know</span>
          </div>
          <ul className="space-y-2.5">
            {[
              { label: "Budget & Checklist stay on this device.", body: "These two tabs save data in your current browser for privacy. Switch to another device and you won't see them there. RSVPs and seating are saved online." },
              { label: "Seating chart is available everywhere.", body: "Your table assignments are saved online, so you can check or edit the seating plan from any device you log into." },
              { label: "Editing never breaks your link.", body: "Change the cover photo, update the text, swap the theme — your guests' link and QR code stay the same and always work." },
              { label: "Canva QR tip.", body: "Download the QR code as SVG, bring it into Canva, and recolor it to match your invitation palette. Scan quality is unaffected." },
              { label: "Guest numbers update instantly.", body: "The moment someone fills in your form, the counts in your dashboard change on their own. You don't need to refresh." },
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

        {/* ── Footer ── */}
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

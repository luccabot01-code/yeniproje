"use client"

import {
  HelpCircle, X, Heart, Camera, UtensilsCrossed,
  Users, LayoutDashboard, MapPin, QrCode, Mail, ExternalLink, Sparkles
} from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { motion } from "framer-motion"

interface HelpCenterDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

// ─── SECTION DATA ──────────────────────────────────────────────────────────────

const sections = [
  {
    id: "section-1",
    icon: Heart,
    number: "01",
    title: "The Premium Wedding RSVP Platform",
    content: [
      {
        heading: "What It Is",
        body: "Premium Wedding RSVP & Planner is an all-in-one digital wedding management platform. Instead of chasing replies by phone, paper, or group chat, you create a beautiful, personalized invitation page and share it with your guests via a private link or QR code. Every response flows instantly into your private command center — no refresh needed, no manual counting.",
      },
      {
        heading: "Real-Time, Always",
        body: "The entire platform is built on Supabase — a real-time PostgreSQL database. The moment a guest hits Submit on their phone, your dashboard counters, guest table, and all tabs update live. This is not polling; it is a persistent WebSocket subscription. Zero delay, zero manual refresh. Every RSVP, every meal selection, every accompanying guest appears in your dashboard the instant it is recorded.",
      },
      {
        heading: "One Link, Forever",
        body: "Your RSVP link and QR code are generated the moment your wedding is created and will never change. You can completely redesign the invitation — swap themes, replace the cover video, rewrite every field — and the link guests already have continues to work perfectly. You will never need to resend your invitation.",
      },
    ],
  },
  {
    id: "section-2",
    icon: Camera,
    number: "02",
    title: "Creating Your Wedding",
    content: [
      {
        heading: "Getting Started",
        body: "On the homepage, click \"Create New Wedding\" and complete the setup form. The required fields are: Wedding Title, Date & Time, Venue / Location, your name as the Host, and your Host Email. Your email becomes your permanent login identity — it cannot be changed after creation, so enter it carefully.",
      },
      {
        heading: "Cover Media",
        body: "Upload a cover photo or video up to 50 MB. Supported formats include JPG, PNG, WebP, GIF, MP4, and MOV. When you upload a video, it plays at 0.75× cinematic speed in a seamless infinite loop with a refined blur backdrop behind the RSVP form — delivering a premium, film-like experience from the moment guests open your invitation.",
      },
      {
        heading: "Event Details & Enrichments",
        body: "Paste a Google Maps or Apple Maps link in the Location URL field, and guests will see a direct \"View on map\" button. Add a Gift Registry URL and a gift button appears automatically. Describe your attire expectations in the Dress Code field. Use Program / Notes for any additional information — long notes are automatically expandable so the page stays elegant.",
      },
      {
        heading: "Wedding Day Itinerary",
        body: "Build a full day-of timeline by adding entries with a time (e.g. \"4:00 PM\"), a title (e.g. \"Ceremony\"), and an optional description. On desktop, the itinerary renders as a refined zigzag timeline. On mobile, it becomes a clean vertical list. Guests see the complete schedule before they fill out the RSVP form.",
      },
      {
        heading: "Countdown Timer",
        body: "Toggle \"Show Wedding Countdown\" to display a live, animated countdown on the invitation page — ticking down days, hours, minutes, and seconds in real time. It automatically inherits the color palette of your chosen theme.",
      },
      {
        heading: "Our Story Timeline",
        body: "Add relationship milestone cards with a photo (up to 10 MB), a date, a title, and a description. Use the reorder arrows to arrange them chronologically. The story appears as a vertical photo timeline on the invitation page, giving guests an intimate glimpse into your journey before the celebration.",
      },
    ],
  },
  {
    id: "section-3",
    icon: UtensilsCrossed,
    number: "03",
    title: "Custom Menus & Catering",
    content: [
      {
        heading: "Creating Your Menu",
        body: "When creating or editing your wedding, you can build a fully custom menu for your event. In the Edit Wedding form, navigate to the Menu Options section and add as many menu items as you like. Each item has a Title (e.g. \"Herb-Crusted Lamb\") and an optional Description (e.g. \"Served with roasted root vegetables and a red wine reduction\"). These become the selectable meal options presented to every guest during the RSVP process.",
      },
      {
        heading: "How Guests Choose Their Meal",
        body: "When custom menus are active, every guest — including each accompanying party member — is presented with a meal selection step during the RSVP flow. Selections are displayed as elegant clickable cards. Guests choose one option per person. If no menu options have been configured, the meal selection step is hidden entirely and the RSVP form remains uncluttered.",
      },
      {
        heading: "The Catering Dashboard",
        body: "All meal selections flow directly into the Guest List & Catering tab of your dashboard. This dedicated view gives you everything your caterer or venue coordinator needs. At a glance you see: Total Covers (broken down by adults and children), Meals Selected (with a live count of pending selections), and Dietary Notes (the number of guests with special requirements).",
      },
      {
        heading: "Catering Overview & Breakdown",
        body: "Below the summary cards, the Catering Overview section displays a visual bar chart breaking down every menu option by count and percentage. If 45 out of 100 guests chose the salmon, the bar fills to 45% instantly. This breakdown updates in real time as more RSVPs arrive.",
      },
      {
        heading: "Per-Guest Meal Table",
        body: "The full guest table lists every individual attendee — primary guests and each member of their party — with their name, role (Primary / Guest), age group (Adult / Child), age range (for children), their meal selection, and any dietary notes. Search by name or meal option to quickly find specific guests. Click \"Export for Caterer\" to download a complete CSV formatted for your catering team.",
      },
    ],
  },
  {
    id: "section-4",
    icon: Users,
    number: "04",
    title: "The Guest RSVP Experience",
    content: [
      {
        heading: "What Guests See",
        body: "When a guest opens your invitation link, they are greeted with your cover media filling the full top of the page, followed by the wedding title, a personalized tagline, the animated countdown (if enabled), the date and time, venue with a map link, dress code, program notes, the full day itinerary, and your Our Story timeline. A gift registry button appears if you provided one. The complete RSVP form sits at the bottom.",
      },
      {
        heading: "Dynamic Group RSVP",
        body: "Guests fill in their own name, optional email and phone number, and their attendance status. They then set the total number of guests in their party — from 1 to 10. For each additional person beyond themselves, the form dynamically adds a dedicated section. Each accompanying guest block requires a full name and allows the guest to designate whether that person is a child.",
      },
      {
        heading: "Children & Age Ranges",
        body: "When an accompanying guest is marked as a child, a required Age Range field appears with two options: 0 – 3 years (infants and toddlers) and 3 – 12 years (young children). These distinctions flow directly into the Catering Dashboard, allowing you and your caterer to differentiate meal planning for infants, children, and adults within the same party.",
      },
      {
        heading: "Meal Selections per Person",
        body: "If you have configured a custom menu, every person in the party — the primary guest and each accompanying member — selects their meal individually. Meal cards are displayed as stylish, tap-to-select tiles. This ensures per-head accuracy for your caterer rather than a single selection for the entire party.",
      },
      {
        heading: "Song & Travel Requests",
        body: "Every RSVP form includes a song request field (\"What song will get you on the dance floor?\") and two logistics questions: whether the guest will use the complimentary shuttle service, and whether they have booked a room in your hotel block. These fields are optional but feed directly into the Song Requests and Travel & Lodging dashboard tabs.",
      },
      {
        heading: "Updating an RSVP",
        body: "If a guest needs to update their response — a change of plans, a new dietary need, an extra guest — they simply resubmit the form using the same name. Their previous entry is automatically replaced. Guests can also click \"Add to Calendar\" to generate a standard .ics file compatible with Apple Calendar, Google Calendar, Outlook, and all major calendar applications.",
      },
    ],
  },
  {
    id: "section-5",
    icon: LayoutDashboard,
    number: "05",
    title: "Your Command Center & Dashboard",
    content: [
      {
        heading: "Live Statistics",
        body: "The Overview tab greets you with four live stat cards: Total RSVPs (the raw number of form submissions), Attending (confirmed guests), Not Attending (declined), and Total Guests (the sum of all party members across attending RSVPs). All four update in real time via Supabase subscriptions — the instant any guest submits, the numbers change on your screen.",
      },
      {
        heading: "Guest Responses Table",
        body: "Every RSVP submission appears in a full table with the guest's name, attendance status, party size, contact information, any message left for the couple, and submission time. If a guest left a message, a message icon appears on their row — click to read it in a popup. The trash icon permanently deletes that response.",
      },
      {
        heading: "Guest List & Catering Tab",
        body: "This dedicated tab provides a per-individual breakdown of every attending guest and their meal selection. It is designed to be handed directly to your caterer. Summary cards show total covers, meals selected vs. pending, and dietary notes. The Catering Overview chart visualizes meal distribution. The full table supports search and exports to CSV via \"Export for Caterer\".",
      },
      {
        heading: "Song Requests Tab",
        body: "Every song request submitted via the RSVP form is collected here with the guest's name and their song. A counter displays the total number of requests. Filter by name or song title, then click \"Export for DJ (CSV)\" to hand the complete playlist off to your DJ or live band.",
      },
      {
        heading: "Travel & Lodging Tab",
        body: "Shuttle and hotel logistics are aggregated here automatically from RSVP responses. Two summary cards show Shuttle Seats Needed (headcount across shuttle-requesting parties) and Hotel Rooms Estimated (guests who confirmed or plan to book). The full filterable table lists every guest's transport and accommodation status. Export via \"Export Logistics (CSV)\".",
      },
    ],
  },
  {
    id: "section-6",
    icon: MapPin,
    number: "06",
    title: "Managing Logistics",
    content: [
      {
        heading: "Seating Chart",
        body: "The Seating Chart tab provides a drag-and-drop interface for organizing your reception tables. All attending guests automatically populate an \"Unseated Guests\" sidebar. Click \"Add New Table\" to create a table with a name, optional category (e.g. \"Bride's Family\"), and a seating capacity. Drag guests from the sidebar onto tables — live seat counters update instantly. Seating data is stored in Supabase and accessible from any device.",
      },
      {
        heading: "Budget & Expenses",
        body: "The Budget & Expenses tab is a full financial management tool. Set a total budget target, record individual expense items with estimated and actual costs, responsible parties, and payment status. A donut pie chart breaks down spending by category (Venue, Catering, Photography, etc.). The Financial Ledger tracks every line item with cost variance and payment progress. Export the full ledger as CSV at any time.",
      },
      {
        heading: "Planning Checklist",
        body: "The Planning Checklist organizes every wedding preparation task into five time-frame categories: 12+ Months Out, 6–9 Months Out, 3 Months Out, The Final Month, and Post-Wedding. A circular progress ring shows your overall completion percentage. Mark tasks complete, add your own custom tasks to any category, and delete tasks you do not need. All checklist and budget data is stored in your browser's localStorage and persists across sessions.",
      },
    ],
  },
  {
    id: "section-7",
    icon: QrCode,
    number: "07",
    title: "Sharing & QR Codes",
    content: [
      {
        heading: "Your Permanent Invitation Link",
        body: "Your RSVP link is generated the moment your wedding is created and is permanent — it will never change, regardless of any edits you make to the wedding. The link is unlisted, meaning it is not indexed by search engines. Anyone with the link can submit an RSVP, so share it only with your intended guests. Find it in Dashboard → Overview → Quick Actions.",
      },
      {
        heading: "QR Code Downloads",
        body: "Your QR code is available in Dashboard → Overview → Quick Actions → \"View QR Code\". The modal offers two download formats: PNG/JPG (a raster image ideal for printing or digital sharing) and SVG (a lossless vector file). Both formats produce a fully scannable code. No smartphone app is required — the QR code opens directly in the guest's browser.",
      },
      {
        heading: "The Canva SVG Trick",
        body: "Download the QR code as an SVG file and import it into Canva. Because SVG is a vector format, you can recolor the QR code to exactly match your invitation's palette — matching your accent color, your floral theme, or your stationery gold — without any quality loss whatsoever. The scan integrity is fully preserved regardless of color changes. This is the recommended approach for printed wedding stationery.",
      },
    ],
  },
]

// ─── COMPONENT ─────────────────────────────────────────────────────────────────

export function HelpCenterDialog({ open, onOpenChange }: HelpCenterDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[95vw] md:max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 bg-background border border-border shadow-2xl rounded-2xl [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-foreground/35 [scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.2)_transparent] dark:[scrollbar-color:rgba(255,255,255,0.2)_transparent]"
        overlayClassName="bg-black/60 backdrop-blur-sm"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Help Center — Complete Wedding Platform Guide</DialogTitle>

        {/* ── Header ── */}
        <motion.div
          className="relative px-8 py-10 md:px-12 md:py-12 bg-foreground text-background overflow-hidden"
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Subtle dot grid texture */}
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
              Help Center
            </motion.h1>

            <motion.p
              className="text-background/65 text-sm md:text-base leading-relaxed max-w-lg"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.38, delay: 0.28 }}
            >
              Your complete guide to every feature of the platform — from building your invitation to managing every guest detail in real time.
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
                    <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/40 transition-colors group [&[data-state=open]]:bg-muted/30">
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

        {/* ── Pro Tips Strip ── */}
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
              { label: "Unbreakable link.", body: "Swap themes, replace the cover video, rewrite every field — your RSVP link and QR code are permanent identifiers that never change." },
              { label: "Canva QR trick.", body: "Download the QR as SVG and import into Canva to recolor it to your exact palette. Scan quality is fully preserved in vector format." },
              { label: "Group RSVP is per-person.", body: "Every accompanying guest gets their own meal selection and child designation. Your caterer receives per-head data, not party-level estimates." },
              { label: "0–3 vs 3–12 age ranges.", body: "The two child age brackets help your venue and caterer distinguish between infants (no seat / baby menu) and young children (children's menu)." },
              { label: "Seating is cloud-backed.", body: "Unlike the budget and checklist (localStorage), seating assignments are stored in Supabase and sync across every device you use." },
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

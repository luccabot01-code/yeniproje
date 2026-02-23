"use client"

import {
  HelpCircle, Sparkles, X, Heart, Users, QrCode, Download,
  Palette, Lock, Globe, Music, Bus, Wallet, CheckSquare,
  Clock, Mail, Eye, Camera, ChevronRight
} from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { motion } from "framer-motion"

interface HelpCenterDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

// ─── DATA ──────────────────────────────────────────────────────────────────────

const sections = [
  {
    icon: Heart,
    title: "What This Platform Is",
    body: `Premium Wedding RSVP & Planner is an all-in-one digital wedding management platform. Instead of chasing replies by phone, paper, or group chat, you create a beautiful personalized wedding invitation page and share it with your guests via a link or QR code. Guests open the page, fill out the RSVP form, and every response flows instantly into your private dashboard — no refresh needed, no manual counting.

The platform handles everything from the moment a guest says "yes" to the last detail before the big day: attendance tracking, seating arrangements, travel logistics, song requests, budget management, and a full wedding planning checklist. Everything lives in one place, accessible from any device.`,
  },
  {
    icon: Camera,
    title: "Creating Your Wedding",
    body: `Getting started takes only a few minutes. On the homepage, click "Create New Wedding" and fill in the form.

The required fields are Wedding Title, Date & Time, Venue / Location, your name as the host, and your host email address. Your email becomes your permanent login identity and cannot be changed later.

Beyond the basics, you can enrich the invitation with a number of optional but highly recommended fields. Upload a cover photo or video — any standard image or MP4/MOV file up to 50 MB. When you upload a video, it plays at 0.75× cinematic speed in a seamless infinite loop with a soft blur backdrop behind the RSVP form, giving guests a premium film-like experience. Paste a Google Maps or Apple Maps link in the Location URL field and guests will see a direct "View on map" button. Add a Gift Registry or Fund URL and a gift button appears on the invitation. Describe the expected attire in the Dress Code field. Use Program / Notes for any extra information — long notes automatically get a "Read more" expandable section so the page stays clean.

The Wedding Day Itinerary lets you build a full day timeline. Each entry has a time (e.g. "4:00 PM"), a title (e.g. "Ceremony"), and an optional description. On desktop the itinerary renders as an elegant zigzag timeline; on mobile it becomes a clean vertical list. Guests see the full schedule before they fill out the form.

Toggle Show Wedding Countdown on to display an animated live countdown on the invitation page. It ticks in real time — days, hours, minutes, and seconds — and automatically matches your chosen theme's color.

Our Story is a relationship milestone timeline. Each card can have a photo (up to 10 MB), a date, a title, and a description. Use the up/down arrows to reorder the cards. The story appears as a vertical timeline on the invitation page, giving guests a glimpse into your journey before the wedding.

Before submitting, click "Preview RSVP Form" to see exactly what guests will see — cover media, event details, itinerary, countdown, and the full RSVP form — all rendered live.`,
  },
  {
    icon: Lock,
    title: "Host Login & Dashboard Access",
    body: `Once your wedding is created, click "Host Login" on the homepage. Enter your host email address. On your very first login, you will also be asked for the one-time access token you received with your purchase. This token links permanently to your email on first use. After that, only your email address is needed — the token never needs to be entered again and cannot be transferred to a different email.

Sessions stay active for 24 hours. If you have multiple weddings under the same email, after logging in you will see a list of all of them and can navigate to any individual dashboard.

If you lose access, contact support at sahinturkzehra@gmail.com with your host email and purchase details.`,
  },
  {
    icon: Globe,
    title: "Sharing Your Invitation",
    body: `After your wedding is created, your RSVP link and QR code are generated instantly and will never change. You can completely redesign the wedding — swap the theme, replace the cover video, update the itinerary — and the link stays the same. Guests who already have it never need to receive a new one.

To find your link, go to the Dashboard → Overview tab → Quick Actions panel. Click "Open Invitation Link" to preview it in a new tab, or "Copy Invitation Link" to copy the URL to your clipboard. Share it via WhatsApp, iMessage, email, social media, or print it on physical stationery.

The link is unlisted — not indexed by search engines. Anyone who has the link can submit an RSVP, so share it only with your intended guests.`,
  },
  {
    icon: QrCode,
    title: "QR Code",
    body: `Your QR code is available in the Dashboard → Overview tab → Quick Actions → "View QR Code". The modal that opens gives you two download formats.

PNG/JPG is a raster image suitable for printing or sharing digitally. SVG is a lossless vector file — import it into Canva and you can recolor it to exactly match your invitation's palette without any quality loss whatsoever. The QR code remains fully scannable regardless of color changes.

Guests point their phone camera at the printed or digital QR code. No app is required — it opens directly in their browser and lands on your invitation page.`,
  },
  {
    icon: Users,
    title: "The Guest RSVP Experience",
    body: `When a guest opens your invitation link they see your cover photo or video filling the top of the page, followed by the wedding title, a "You're invited!" tagline, the animated countdown (if enabled), date and time, venue with the map link, dress code, program notes, the wedding day itinerary, and your Our Story timeline. A gift registry button appears if you provided one.

Below all of that is the RSVP form. Guests fill in their name (required), optional email and phone number, attendance status (Attending or Not Attending), number of guests in their party, a message to the couple, a song request ("What song will get you on the dance floor?"), and two travel and logistics questions.

The travel questions ask: "Will you be using the complimentary shuttle service?" (Yes / No, I have my own transportation) and "Have you booked a room in our hotel block?" (Yes / No / Planning to book soon / Staying elsewhere). The answers from these questions feed directly into the Travel & Lodging dashboard tab.

Guests can add any number of accompanying people. Each accompanying guest gets their own fields: first name, last name, adult or child toggle, and age range (for children).

If a guest needs to update their response, they simply submit the form again using the same name — their previous response is replaced automatically. An "Add to Calendar" button generates a universal .ics file compatible with Apple Calendar, Google Calendar, Outlook, and all standard apps, including the venue, date, time, and a one-hour advance reminder.`,
  },
  {
    icon: Eye,
    title: "Overview Tab — Your Dashboard Home",
    body: `The Overview tab is the first screen you see when you open your dashboard. At the top are four live statistic cards: Total RSVPs (the total number of RSVP submissions), Attending (confirmed guests), Not Attending (declined), and Total Guests (the attending count multiplied by each party's size). All four update in real time the instant a guest submits their form — powered by Supabase's real-time subscriptions.

Below the stats is the Guest Responses table. Every RSVP submission appears here with the guest's name, attendance status, party size, any message they left, and submission time. If a guest left a message, a message icon appears on their row — click it to read the full message in a popup. The trash icon deletes the response entirely.

The Quick Actions panel sits alongside the table with four buttons: Open Invitation Link (opens the invitation page in a new tab), Copy Invitation Link (copies the URL to your clipboard), Export Guest List (downloads a CSV of all responses with names, statuses, contact info, and messages), and View QR Code (opens the QR download modal).`,
  },
  {
    icon: Music,
    title: "Song Requests Tab",
    body: `Every guest who filled in the song request field on the RSVP form appears here. The tab shows a counter with the total number of requests, a search bar to filter by guest name or song title, and a list of all the requests.

Click "Export for DJ (CSV)" to download the complete song request list including guest names and song titles. Share this file directly with your DJ or live band so they can prepare the perfect playlist for your wedding night.`,
  },
  {
    icon: Bus,
    title: "Travel & Lodging Tab",
    body: `The Travel & Lodging tab aggregates the two logistics questions from the RSVP form. At the top are two summary cards: Shuttle Seats Needed, which shows the total headcount of guests whose entire parties requested the shuttle service, and Hotel Rooms Estimated, which is calculated from the guests who confirmed or said they plan to book a room in your hotel block.

Below the cards is a full table of every guest with their shuttle and hotel responses. The table is filterable so you can quickly see just the shuttle riders or just the hotel guests.

Click "Export Logistics (CSV)" to download a file with all shuttle and hotel information — ready to share with a transfer company, hotel coordinator, or venue contact.`,
  },
  {
    icon: Users,
    title: "Seating Chart Tab",
    body: `The Seating Chart tab gives you a full drag-and-drop interface for organizing your reception tables. All attending guests automatically populate an "Unseated Guests" sidebar on the left (or a collapsible panel on mobile).

Click "Add New Table" to create a table. Give it a name (e.g. "Head Table" or "Family Table"), an optional group category (e.g. "Bride's Family" or "Groom's Friends"), and a seating capacity. Once created, drag any guest card from the sidebar and drop it onto a table. Live seat counters update instantly. If a table is full, the system will block the assignment and show an alert.

To unassign a guest, drag them back to the sidebar or click their name on the table to return them to the unseated pool. To delete a table, click the trash icon on it — all guests assigned to that table are automatically returned to the unseated list. Seating data is saved to the database and persists across sessions.`,
  },
  {
    icon: Wallet,
    title: "Budget & Expenses Tab",
    body: `The Budget & Expenses tab is a full financial management tool for your wedding. At the top are three cards: Budget Strategy shows your total budget target with an edit button (click the pencil icon and type a new amount), Total Commitments shows the sum of all recorded expenses alongside a visual progress bar that turns yellow when you exceed 80% and red if you go over budget, and Cash Outflow Remaining shows how much is still left to pay after deposits and payments.

Below the cards is the Spending Allocation chart — a donut pie chart that breaks down your expenses by category (Venue, Catering, Photography, Videography, Attire, Decor, Entertainment, Rings, Stationery, Beauty, and Other). Hover over any slice to see the exact dollar amount and percentage of total budget.

The Financial Ledger is the main expense table. Each row shows the expense name and category, the responsible party (The Couple, Bride's Family, Groom's Family, or Other), the cost variance (estimated vs. actual, with a color-coded badge showing the difference), the settlement progress (amount paid in green, remaining balance in orange), and a payment status badge (Fully Paid, Partial, or Planning). If you attached a contract link, a button to open it appears on the row.

To add an expense, click "Record Expense". The modal has three tabs. Core Details is for the expense name, category, and who is responsible for it. Financials is where you enter the estimated cost, actual confirmed cost (if known), and the amount already paid. Advanced lets you add the vendor name, a target payment date, and a link to the contract or invoice PDF.

Click "Export CSV" to download the full financial ledger including all cost details, payment status, and vendor information.

All budget and expense data is stored in your browser's localStorage. It persists across page refreshes and browser restarts, but is specific to the browser and device you are using.`,
  },
  {
    icon: CheckSquare,
    title: "Planning Checklist Tab",
    body: `The Planning Checklist tab keeps your entire wedding preparation organized from the first decision to the thank-you notes. Tasks are grouped into five time-frame categories: 12+ Months Out, 6–9 Months Out, 3 Months Out, The Final Month, and Post-Wedding. Each category is a collapsible accordion section with its own completion counter.

At the top of the tab is a Wedding Readiness card showing a circular progress ring and an animated progress bar. The ring fills as you complete tasks, and the text inside always shows your current completion percentage. A "tasks remaining" count keeps you aware of what is left.

Clicking the circle icon next to any task marks it complete — it gets a strikethrough and the progress ring updates instantly. Hovering over a task reveals a trash icon to delete it permanently.

To add your own task, click "Add Task". Type the task description and select which time-frame category it belongs to. The task is added immediately and contributes to the overall progress percentage.

All checklist data is stored in your browser's localStorage. Your progress is preserved across page refreshes, browser restarts, and device sleep cycles.`,
  },
  {
    icon: Clock,
    title: "Editing Your Wedding",
    body: `You can change almost anything about your wedding at any time. Click "Edit Wedding" in the dashboard top bar to open the edit form. Everything except your host email can be updated: the title, date and time, venue, location URL, dress code, program notes, cover photo or video (up to 50 MB), gift registry URL, the full wedding day itinerary, the countdown toggle, and every Our Story card.

Edits save instantly. The invitation page updates for all guests the moment you save — no one needs to reload their browser.

Most importantly: editing your wedding never breaks your RSVP link or QR code. They are permanent identifiers. All existing RSVP responses are fully preserved through any edit. Your host email address is the only field that cannot be changed — contact support if you have an urgent access issue.`,
  },
  {
    icon: Palette,
    title: "Themes & Visual Customization",
    body: `The platform offers six professionally designed themes that transform the look and feel of your invitation page: Default (Modern), Minimalist, Rustic (warm browns and earth tones), Floral (pink and blush), Ocean (cool blues and teals), and Vintage (rich gold tones). Each theme changes the color palette, backgrounds, and overall typographic atmosphere.

To change the theme, click the palette "Theme RSVP" button in the dashboard top bar. Select any theme from the dropdown — the change saves to the database immediately and the invitation page updates live for all guests without any refresh needed.

Inside the same dropdown, there is an "Apply to Dashboard" toggle. Turning it on applies the selected theme's color scheme to your admin dashboard as well, so your entire experience is visually consistent. Toggle it off to return to the default dashboard appearance.

The sun and moon icon in the dashboard top bar switches between light and dark mode. The transition uses the browser's View Transition API for a smooth animated switch. Your preference is saved to the browser and remembered on future visits.`,
  },
  {
    icon: Download,
    title: "All Exports at a Glance",
    body: `The platform provides four distinct CSV exports, each tailored for a specific purpose.

The Guest List export (Overview tab → Quick Actions → Export Guest List) contains every RSVP submission with name, attendance status, party size, contact information, message, and submission time. This is your general attendance record.

The Song Request export (Song Requests tab → Export for DJ) contains every song request with guest names and song titles. This goes to your DJ or band.

The Logistics export (Travel & Lodging tab → Export Logistics) contains shuttle and hotel responses for every guest. Share this with your transfer company or hotel contact.

The Budget export (Budget & Expenses tab → Export CSV) contains your full financial ledger including all cost details, payment status, variance data, and vendor information.`,
  },
  {
    icon: Sparkles,
    title: "How the Real-Time System Works",
    body: `The entire platform is built on Supabase, a real-time PostgreSQL database. When a guest submits their RSVP form, the data is written to the database instantly and Supabase broadcasts the change to every open dashboard session. This means the moment a guest hits Submit on their phone, your dashboard counters, guest table, and all tabs update live — no page refresh ever required.

There is no limit on the total number of RSVP submissions. Each individual submission can include up to ten accompanying guests. Cover media supports any standard image format (JPG, PNG, WebP, GIF) or video format (MP4, MOV) up to 50 MB. Our Story card photos support any standard image up to 10 MB each.

Budget and checklist data are stored in your browser's localStorage rather than the database, which means they are private to the device and browser where you manage the dashboard. Seating chart data is stored in the database and is accessible from any device.`,
  },
]

// ─── SUB-COMPONENTS ────────────────────────────────────────────────────────────

function Section({ section, index }: { section: typeof sections[0]; index: number }) {
  const Icon = section.icon
  const paragraphs = section.body.split("\n\n").filter(Boolean)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.025 }}
      className="rounded-2xl border border-border bg-card overflow-hidden"
    >
      {/* Section header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-muted/30">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
          <Icon className="h-4 w-4 text-primary-foreground" />
        </div>
        <h3 className="font-bold text-foreground text-base tracking-tight">{section.title}</h3>
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-3">
        {paragraphs.map((para, i) => (
          <p key={i} className="text-sm text-muted-foreground leading-relaxed">
            {para}
          </p>
        ))}
      </div>
    </motion.div>
  )
}

function ProTipsSection() {
  const tips = [
    {
      label: "Your link is unbreakable.",
      body: "Edit the title, swap the cover video, change the theme — your RSVP link and QR code are permanent identifiers that never change. You will never need to resend the invitation."
    },
    {
      label: "Real-time means exactly that.",
      body: "The moment a guest submits on their phone, every counter and table in your dashboard updates live. No refresh, no polling, no delay."
    },
    {
      label: "The Canva QR trick.",
      body: "Download the QR code as SVG, import it into Canva, and recolor it to match your exact invitation palette. The QR code remains fully scannable regardless of color changes — vector format preserves every detail."
    },
    {
      label: "Cinematic video cover.",
      body: "Upload a short video clip as your cover. It plays at 0.75× speed in an infinite loop with a blurred backdrop behind the RSVP form — a premium film-like experience for guests before they even start filling out the form."
    },
    {
      label: "Budget and checklist are browser-persistent.",
      body: "All budget entries and planning tasks are saved in your browser's localStorage. Closing the tab, refreshing, or restarting your computer will not lose any data — as long as you use the same browser on the same device."
    },
      {
        label: "Drag-and-drop seating is backed by the database.",
      body: "Unlike the budget and checklist, seating assignments are stored in Supabase. They are visible and editable from any device or browser you use to log in."
    }
  ]

  return (
    <div className="rounded-2xl border border-border bg-muted/20 overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-muted/30">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        <h3 className="font-bold text-foreground text-base tracking-tight">Tips Worth Knowing</h3>
      </div>
      <ul className="px-6 py-5 space-y-4">
        {tips.map((tip, i) => (
          <li key={i} className="flex items-start gap-3 text-sm leading-relaxed">
            <ChevronRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <span className="text-muted-foreground">
              <span className="font-semibold text-foreground">{tip.label} </span>
              {tip.body}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SupportSection() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-background p-6 text-center space-y-3">
      <div className="flex items-center justify-center gap-2 text-foreground font-semibold text-sm">
        <Mail className="h-4 w-4" />
        <span>Need help or have a feature request?</span>
      </div>
      <a
        href="mailto:sahinturkzehra@gmail.com"
        className="inline-flex items-center justify-center h-10 px-6 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
      >
        Contact Support
      </a>
      <p className="text-xs text-muted-foreground">
        Also visit our shop:{" "}
        <a
          href="https://www.etsy.com/shop/FlorMontana"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          etsy.com/shop/FlorMontana
        </a>
      </p>
    </div>
  )
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

export function HelpCenterDialog({ open, onOpenChange }: HelpCenterDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[95vw] md:max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 bg-background border border-border shadow-2xl [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-foreground/40 [scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.2)_transparent] dark:[scrollbar-color:rgba(255,255,255,0.2)_transparent]"
        overlayClassName="bg-black/60 backdrop-blur-sm"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Premium Wedding RSVP & Planner — Help Center</DialogTitle>

        {/* ── Header ── */}
        <motion.div
          className="relative p-8 md:p-12 bg-primary text-primary-foreground overflow-hidden border-b border-border"
          initial={{ opacity: 0, y: -32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Animated shimmer sweep across header */}
          <motion.div
            className="pointer-events-none absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-primary-foreground/10 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
          />

          {/* Dot grid */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,_rgba(255,255,255,0.4)_1px,_transparent_1px)] bg-[length:24px_24px]" />

          {/* Glowing orb top-right */}
          <motion.div
            className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary-foreground/10 blur-3xl"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          />

          {/* Close button */}
          <motion.button
            onClick={() => onOpenChange?.(false)}
            className="absolute top-4 right-4 md:top-6 md:right-6 p-3 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-all duration-200 hover:scale-110 z-50 cursor-pointer"
            aria-label="Close"
            initial={{ opacity: 0, scale: 0.6, rotate: -90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.35, delay: 0.4, type: "spring", stiffness: 260, damping: 20 }}
            whileHover={{ rotate: 90, scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="h-5 w-5" />
          </motion.button>

          <div className="relative z-10 max-w-2xl">
            {/* Icon badge — springs in with bounce */}
            <motion.div
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-foreground/10 mb-6 border border-primary-foreground/20"
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ duration: 0.55, delay: 0.18, type: "spring", stiffness: 220, damping: 14 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -8, 5, 0] }}
                transition={{ duration: 1.8, delay: 0.9, ease: "easeInOut", repeat: Infinity, repeatDelay: 4 }}
              >
                <HelpCircle className="h-7 w-7" />
              </motion.div>
            </motion.div>

            {/* Title — words stagger in */}
            <div className="text-3xl md:text-4xl font-bold mb-3 tracking-tight overflow-hidden">
              {"Help Center".split("").map((char, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  style={{ whiteSpace: char === " " ? "pre" : "normal" }}
                  initial={{ opacity: 0, y: 28, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{
                    duration: 0.38,
                    delay: 0.3 + i * 0.03,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </div>

            {/* Subtitle — fade + slide */}
            <motion.p
              className="text-primary-foreground/75 text-base md:text-lg leading-relaxed"
              initial={{ opacity: 0, y: 14, filter: "blur(3px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.45, delay: 0.62, ease: [0.22, 1, 0.36, 1] }}
            >
              A complete guide to every feature of the platform — from creating your wedding to managing every last guest detail.
            </motion.p>

            {/* Animated underline accent */}
            <motion.div
              className="mt-5 h-0.5 rounded-full bg-primary-foreground/30"
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.55, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </motion.div>

        {/* ── Content ── */}
        <motion.div
          className="p-6 md:p-10 bg-background flex flex-col gap-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.55, ease: "easeOut" }}
        >
          {sections.map((section, index) => (
            <Section key={section.title} section={section} index={index} />
          ))}

          <div className="flex flex-col gap-4 mt-2">
            <ProTipsSection />
            <SupportSection />
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}

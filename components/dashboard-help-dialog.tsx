"use client"
import { HelpCircle, Sparkles, BarChart3, Palette, Users, Settings2, Music, Bus, Wallet, CheckSquare } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { motion } from "framer-motion"

interface DashboardHelpDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const comprehensiveGuide = [
  {
    icon: Settings2,
    title: "1. Top Bar & Core Controls",
    overview: "Your main command center at the very top of the dashboard.",
    features: [
      { name: "Wedding Title & Details", description: "Your wedding name, date and venue are displayed on the top left. Click the small cover image or video thumbnail to open a full-screen preview." },
      { name: "Light / Dark Mode Toggle", description: "Switch between Light and Dark mode using the toggle on the top right. Transitions are silky smooth thanks to the View Transition API." },
      { name: "Theme RSVP (Palette Icon)", description: "Choose a visual theme for your invitation: Default, Minimalist, Rustic, Floral, Ocean, or Vintage. When the 'Apply to Dashboard' toggle is enabled, the selected theme also applies to the entire admin panel." },
        { name: "Edit Wedding", description: "Update the wedding title, date & time, venue, location URL, dress code, program notes, cover photo/video, gift registry URL, itinerary, the 'Our Story' section, and the countdown timer — all from this modal." },
      { name: "Refresh", description: "Reloads the entire page and fetches the latest RSVP data. Because the app uses real-time subscriptions you rarely need this, but it's useful if you ever notice a delay." },
      { name: "Help (This Window)", description: "Opens this comprehensive guide explaining every feature on the dashboard." }
    ]
  },
  {
    icon: BarChart3,
    title: "2. 'Overview' Tab",
      overview: "A real-time snapshot of your wedding's performance, plus all sharing tools.",
    features: [
      { name: "Stats Cards (4 Cards)", description: "Shows Total Responses, Attending, Not Attending, and Total Guests in real time. The 'Total Guests' count includes all plus-ones and children." },
      { name: "Guest Responses Table", description: "Lists every RSVP submission: name, status (Attending / Not Attending), guest count, contact info (email/phone), message, and submission date. Messages longer than 50 characters can be expanded with 'Show more'. Each row has a trash icon to delete the RSVP." },
      { name: "Quick Actions", description: "Four action buttons on the right panel: (1) Open Invitation Link — opens the invitation in a new tab; (2) Copy Invitation Link — copies the link to clipboard; (3) View QR Code — opens the QR code modal; (4) Export Guest List — downloads the guest list as CSV (disabled when there are no guests)." },
      { name: "QR Code Modal", description: "Download a high-resolution QR code in PNG/JPG or SVG format. The SVG version can be imported into Canva to match the exact hex colors of your invitation without losing scan quality." }
    ]
  },
  {
    icon: Music,
    title: "3. 'Song Requests' Tab",
    overview: "A central hub for all DJ song requests submitted by your guests.",
    features: [
      { name: "Total Request Counter", description: "Displays the total number of song requests submitted by attending guests." },
      { name: "Search by Name or Song", description: "Instantly filter the list by guest name or song title." },
      { name: "CSV Export for DJ", description: "Click 'Export for DJ (CSV)' to export the full request list into a CSV file ready to hand off to your DJ." }
    ]
  },
  {
    icon: Bus,
    title: "4. 'Travel & Lodging' Tab",
    overview: "Coordinates your guests' transportation and accommodation needs.",
    features: [
      { name: "Shuttle Seat Counter", description: "Shows the total number of guests across all shuttle-requesting parties so you know exactly how many seats to reserve." },
      { name: "Hotel Room Estimate", description: "Summarizes the number of guests who have indicated they need or are planning hotel accommodation. Each RSVP submission is counted as one room." },
      { name: "Logistics Table", description: "Displays Shuttle (yes/no) and Hotel (reservation status) information for every guest in a filterable table." },
      { name: "CSV Export", description: "Click 'Export Logistics (CSV)' to export travel and accommodation data to share with a transfer company or hotel." }
    ]
  },
  {
    icon: Users,
    title: "5. 'Seating Chart' Tab",
    overview: "A visual system for assigning attendees to tables.",
    features: [
      { name: "Create a Table", description: "Click 'Add New Table' to add a new table, give it a name (e.g. 'Family Table'), and set its maximum capacity." },
      { name: "Assign Guests", description: "Guests who confirmed attendance are automatically added to the 'Unassigned Guests' list. Click a name to assign them to any table." },
      { name: "Live Capacity Tracking", description: "Each table shows how many people are seated and how many seats remain, updated in real time. The total number of unassigned guests is also displayed." },
      { name: "Delete a Table", description: "Remove an unwanted table with the 'Delete' button. Any guests assigned to that table are automatically returned to the 'Unassigned' list." }
    ]
  },
  {
    icon: Wallet,
    title: "6. 'Budget & Expenses' Tab",
    overview: "A professional financial dashboard to track your wedding budget and all expense items.",
    features: [
      { name: "Total Budget Card", description: "Click the pencil icon to set your target budget. Data is saved to your browser's localStorage." },
      { name: "Total Commitments & Progress Bar", description: "Shows the sum of all expense items and their ratio to the total budget via a visual progress bar. Turns yellow above 80%, red above 100%." },
      { name: "Remaining Cash Flow", description: "Shows the unpaid balance still outstanding and the total amount paid so far." },
      { name: "Category Breakdown (Pie Chart)", description: "Visualizes spending by category — Venue, Catering, Photography, Entertainment, etc. — as a pie chart. Hover over a slice to see the amount and percentage." },
      { name: "Financial Ledger", description: "For each expense item, shows Estimated Cost, Actual Cost, Cost Variance, Payment Status (Fully Paid / Partial / Planning), and the Responsible Party. Contract or invoice links are clickable where provided." },
      { name: "Record Expense", description: "Click 'Record Expense' to add a new expense. The modal has 3 tabs: Core Details (name, category, responsible party), Financials (estimated/actual cost, payment), and Advanced (vendor name, due date, contract URL)." },
      { name: "CSV Export", description: "Click 'Export CSV' to export the entire financial ledger as an Excel/CSV file." }
    ]
  },
  {
    icon: CheckSquare,
    title: "7. 'Planning Checklist' Tab",
    overview: "A smart task list that categorizes your wedding preparations by time frame.",
    features: [
      { name: "Progress Indicator", description: "The hero card at the top shows the percentage of completed tasks both as a number and as a circular progress ring." },
      { name: "Time-Frame Categories", description: "Tasks are split into 5 categories: 12+ Months Out, 6–9 Months Out, 3 Months Out, Final Month, and Post-Wedding. Each category is a collapsible accordion." },
      { name: "Complete a Task", description: "Click the circle icon to mark a task as done. Completed tasks appear with a strikethrough and are visually faded." },
      { name: "Add a Task", description: "Click 'Add Task' to create a new task and choose which time-frame it belongs to. It is automatically included in the progress percentage." },
      { name: "Delete a Task", description: "Hover over a task to reveal the trash icon, then click to remove it from the list." },
      { name: "Persistent Storage", description: "All task data is saved to your browser's localStorage, so your progress is preserved even after closing the page." }
    ]
  },
  {
    icon: Sparkles,
    title: "8. Edit Wedding — Advanced Features",
    overview: "Premium settings that enrich the visual and content experience of your invitation.",
    features: [
      { name: "Cover Photo / Video", description: "Upload a photo or video up to 50 MB. When a video is uploaded, it plays at 0.75× cinematic speed in an infinite loop on the RSVP page, with a premium blur effect behind the form." },
      { name: "Location URL", description: "Add a Google Maps or similar link so guests can navigate to the venue with a single tap." },
      { name: "Gift Registry URL", description: "Add a Zola, Amazon, or any other gift list link so guests can easily find your registry." },
      { name: "Dress Code & Program Notes", description: "Enter the dress code (Formal, Black Tie, etc.) and any program notes. Both are displayed to guests on the RSVP page." },
        { name: "Itinerary (Timeline)", description: "Build a wedding day schedule with time + title + description entries. On desktop it renders as a zigzag timeline; on mobile it becomes a vertical list." },
        { name: "Countdown Timer", description: "Enable 'Show Wedding Countdown' to display an animated countdown timer on the RSVP page. It automatically adapts to the selected theme." },
        { name: "Our Story", description: "Add story cards with a photo, date, title, and description. Cards appear on the RSVP page as a vertical photo timeline. Use the arrow buttons to reorder them." }
      ]
  },
  {
    icon: Palette,
    title: "9. Theme System",
    overview: "Controls the visual identity of the RSVP page and, optionally, the dashboard.",
    features: [
      { name: "6 Ready-Made Themes", description: "Choose from Default (Modern), Minimalist, Rustic (warm browns), Floral (pink/floral), Ocean (blue), or Vintage (gold)." },
      { name: "Selected Theme → RSVP Page", description: "A theme change instantly updates the color scheme, font tones, and background colors of the RSVP page." },
      { name: "Apply to Dashboard Toggle", description: "When this option is on, the selected theme is also reflected across the entire admin panel. Turning it off always returns the dashboard to its default appearance." },
      { name: "Instant Updates", description: "Theme changes are saved to the API and CSS variables are updated immediately — no page refresh needed." }
    ]
  }
]

function SectionBlock({ section, index }: { section: typeof comprehensiveGuide[0]; index: number }) {
  const Icon = section.icon

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-background hover:border-border hover:shadow-md transition-all duration-300">
      {/* Left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-foreground/80 rounded-l-2xl" />

      <div className="flex flex-col md:flex-row gap-0 items-stretch pl-5">
        {/* Left: icon + title */}
        <div className="w-full md:w-56 flex-shrink-0 px-5 py-5 md:border-r border-border/50 flex flex-col gap-2 justify-start">
          <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-foreground text-background shadow-sm mb-1">
            <Icon className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-foreground leading-snug">{section.title}</h3>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{section.overview}</p>
        </div>

        {/* Right: features */}
        <div className="flex-1 px-5 py-5">
          <ul className="space-y-3.5">
            {section.features.map((feature, i) => (
              <li key={i} className="flex flex-col gap-0.5">
                <span className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-foreground/60 flex-shrink-0" />
                  {feature.name}
                </span>
                <span className="text-xs text-muted-foreground leading-relaxed pl-2.5">
                  {feature.description}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function ProTips() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-muted/30">
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-foreground/40 rounded-l-2xl" />
      <div className="pl-5 px-5 py-5 flex items-start gap-4">
        <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-foreground text-background shadow-sm">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-foreground mb-3 text-sm">Pro Tips</h4>
          <ul className="space-y-2.5 text-xs text-muted-foreground">
            <li className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full bg-foreground/40 mt-1.5 flex-shrink-0" />
              <span><strong className="text-foreground font-semibold">Zero-Refresh Magic:</strong> The database uses real-time subscriptions. The moment a guest hits "Submit", counters and guest list update instantly.</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full bg-foreground/40 mt-1.5 flex-shrink-0" />
              <span><strong className="text-foreground font-semibold">Canva QR Code Trick:</strong> Download the QR code in SVG format. Import it into Canva to recolor with exact hex values — scan quality fully preserved.</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full bg-foreground/40 mt-1.5 flex-shrink-0" />
              <span><strong className="text-foreground font-semibold">Unbreakable Link:</strong> Redesign the wedding, swap themes, update the video — your RSVP link never changes.</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full bg-foreground/40 mt-1.5 flex-shrink-0" />
              <span><strong className="text-foreground font-semibold">Persistent Data:</strong> Budget expenses and planning tasks are saved to localStorage. Closing and reopening won't lose your data.</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full bg-foreground/40 mt-1.5 flex-shrink-0" />
              <span><strong className="text-foreground font-semibold">Cinematic Video Effect:</strong> Cover video plays at 0.75× speed in an infinite loop with a blur effect — delivering a premium guest experience.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function SupportSection() {
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-4 rounded-2xl border border-border/60 bg-background">
      <p className="text-xs text-muted-foreground">
        Still have questions or want a custom feature?
      </p>
      <a
        href="mailto:sahinturkzehra@gmail.com"
        className="flex-shrink-0 inline-flex items-center gap-1.5 h-8 px-4 rounded-full bg-foreground text-background text-xs font-semibold hover:bg-foreground/90 transition-all duration-200 hover:scale-[1.03] shadow-sm"
      >
        Contact Support
      </a>
    </div>
  )
}

export function DashboardHelpDialog({ open, onOpenChange }: DashboardHelpDialogProps) {
  const dialogTitle = "Wedding Dashboard Guide"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[95vw] md:max-w-6xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-0 shadow-[0_32px_80px_-12px_rgba(0,0,0,0.35)] rounded-3xl bg-background [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-foreground/15 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-foreground/30 [scrollbar-width:thin]"
        overlayClassName="bg-black/50 backdrop-blur-sm"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">{dialogTitle}</DialogTitle>

        {/* Sticky header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-7 py-5 bg-background/95 backdrop-blur-sm border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-foreground text-background shadow-sm">
              <HelpCircle className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-foreground leading-none">{dialogTitle}</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">A reference for every tab, button, and feature</p>
            </div>
          </div>
            <button
              onClick={() => onOpenChange?.(false)}
              className="group flex items-center justify-center w-9 h-9 rounded-2xl bg-muted/70 hover:bg-foreground border border-border/50 hover:border-foreground backdrop-blur-sm transition-all duration-200 hover:scale-110 active:scale-95 touch-manipulation"
              aria-label="Close"
            >
              <svg className="h-4 w-4 text-foreground/60 group-hover:text-background transition-colors duration-200 group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
        </div>

        {/* Content */}
        <motion.div
          className="p-6 md:p-8 bg-background flex flex-col gap-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <div className="flex flex-col gap-3">
            {comprehensiveGuide.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: 0.06 + index * 0.035, ease: [0.22, 1, 0.36, 1] }}
              >
                <SectionBlock section={section} index={index} />
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col gap-4 mt-2">
            <ProTips />
            <SupportSection />
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}

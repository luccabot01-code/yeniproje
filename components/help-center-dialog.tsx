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

const sections = [
  {
    id: "section-1",
    icon: Heart,
    number: "01",
    title: "Welcome — What Is This?",
    content: [
      {
        heading: "What does this platform do?",
        body: "This is your digital wedding invitation and RSVP page. Instead of calling guests or tracking replies in a spreadsheet, you share one link — guests fill in the form, and you see every response instantly in your personal dashboard. No app to download, no paper to chase.",
      },
      {
        heading: "How does it work?",
        body: "The moment a guest submits the RSVP form, the numbers and tables in your dashboard update automatically. You don't need to refresh the page. Just open your dashboard any morning to see exactly how many people have said yes.",
      },
      {
        heading: "Your link works forever",
        body: "Your invitation link and QR code are created once and never change. You can swap the cover photo, update the text, change the theme — the link your guests already have will always take them to the right page. You'll never need to re-send it.",
      },
    ],
  },
  {
    id: "section-2",
    icon: Camera,
    number: "02",
    title: "Creating Your Invitation",
    content: [
      {
        heading: "Getting started",
        body: "Click \"Create New Wedding\" on the home page and fill in the short form. You'll need a wedding name, date and time, venue, your name, and your email address. Your email becomes your login — it can't be changed later, so double-check it before you confirm.",
      },
      {
        heading: "Cover photo or video",
        body: "Upload a photo or a short video (up to 50 MB). JPG, PNG, WebP, GIF, MP4, and MOV files are all supported. If you upload a video, it plays silently in the background when guests open your invitation — like a cinematic movie poster. A soft blur behind the form keeps everything easy to read.",
      },
      {
        heading: "Location, dress code & notes",
        body: "Paste a Google Maps or Apple Maps link into the Location URL field and guests will see a \"View on Map\" button. Add a gift registry link and a gift button appears automatically. There are separate fields for dress code and program notes — long notes appear in a neatly expandable section so the page never looks cluttered.",
      },
      {
        heading: "Day-of timeline",
        body: "Add your wedding day schedule step by step. For each entry, type a time (e.g. \"4:00 PM\"), a title (e.g. \"Wedding Ceremony\"), and an optional description. On desktop it shows as a beautiful zigzag timeline; on mobile it becomes a clean vertical list. Guests can read the schedule before they fill in the form.",
      },
      {
        heading: "Countdown timer",
        body: "Turn on \"Show Countdown\" and a live timer appears on your invitation page, counting down to your wedding day in days, hours, minutes, and seconds. It automatically picks up the color of whichever theme you've chosen.",
      },
      {
        heading: "Our Story section",
        body: "Add your favorite milestones as a photo timeline — first date, engagement, travels together, anything you like. For each card, upload a photo (up to 10 MB), add a date, a title, and a short note. Drag the order arrows to arrange cards exactly how you want them. Guests get to know you a little better before they RSVP.",
      },
    ],
  },
  {
    id: "section-3",
    icon: UtensilsCrossed,
    number: "03",
    title: "Meal Choices & Food Tracking",
    content: [
      {
        heading: "How do I set up a menu?",
        body: "While creating or editing your wedding, scroll to the \"Menu Options\" section and add as many dishes as you like. Give each one a name (e.g. \"Lamb Chops\") and an optional description (e.g. \"Served with roasted vegetables\"). These options will appear on the RSVP form for guests to choose from.",
      },
      {
        heading: "How do guests pick their meal?",
        body: "If you've added a menu, every person in a guest's party — the main guest and anyone they bring — picks their own meal individually. The options appear as clean cards; guests just tap the one they want. If you haven't set up a menu, this step is hidden entirely and the form stays simple.",
      },
      {
        heading: "Where do I see the food totals?",
        body: "Head to the \"Guest List & Catering\" tab in your dashboard. You'll see how many people are coming (split by adults and children), how many have picked a meal, how many haven't yet, and how many guests have a dietary note. Everything updates as new RSVPs come in.",
      },
      {
        heading: "How many people chose each dish?",
        body: "Below the summary cards, each menu option shows as a visual bar. If 45 out of 100 guests chose the salmon, that bar fills to 45%. The percentages adjust automatically as more people RSVP.",
      },
      {
        heading: "Sending the food list to your caterer",
        body: "Click \"Export for Caterer\" to download a spreadsheet with every guest's name, their meal choice, whether they're an adult or child, and any dietary notes. Email this file to your venue or catering team in the week before the wedding.",
      },
    ],
  },
  {
    id: "section-4",
    icon: Users,
    number: "04",
    title: "How Guests Fill In the Form",
    content: [
      {
        heading: "What does a guest see?",
        body: "When someone opens your link, they see your cover photo or video, the wedding details, the day's schedule, and your Our Story section. The RSVP form comes right after. The page looks beautiful on both phone and desktop — no pinching or scrolling sideways.",
      },
      {
        heading: "Coming with a group",
        body: "After filling in their own name and attendance, guests are asked \"How many people are in your group?\" (from 1 to 10). If they're bringing someone, a separate name and details field appears for each person. Everyone in the group is recorded individually.",
      },
      {
        heading: "Children's age groups",
        body: "When a guest marks someone as a child, two age options appear: 0–3 years (infant) and 3–12 years (young child). This information is included in the catering export so your venue can plan infant vs. child meals correctly.",
      },
      {
        heading: "Everyone picks their own meal",
        body: "If you've set up a menu, each person in the group chooses their own dish — not one choice for the whole table. This means your caterer gets the exact numbers they need, broken down by individual.",
      },
      {
        heading: "Song requests, shuttle & hotel",
        body: "The form also asks for a song request, whether the guest needs shuttle transport, and whether they need a hotel room. These are optional, but the answers feed directly into the matching tabs in your dashboard.",
      },
      {
        heading: "Changing an answer",
        body: "If a guest's plans change, they can simply fill in the form again with the same name — their old answer is replaced automatically. Guests can also tap \"Add to Calendar\" to save your wedding date to Apple, Google, or Outlook.",
      },
    ],
  },
  {
    id: "section-5",
    icon: LayoutDashboard,
    number: "05",
    title: "Your Dashboard — Everything at a Glance",
    content: [
      {
        heading: "The four summary cards",
        body: "At the top of your dashboard you'll see: Total RSVPs (how many people have submitted the form), Attending (those who said yes), Not Attending (those who said no), and Total Guests (the real headcount — every person in every group, including +1s and children). These update the moment someone submits.",
      },
      {
        heading: "The RSVP table",
        body: "Each row shows a guest's name, attendance status, group size, contact details, and — if they left you a message — a small message icon. Click that icon to read the full note in a pop-up. The trash icon on the right permanently removes that guest's entry.",
      },
      {
        heading: "Guest List & Catering tab",
        body: "This is where you'll find everything your caterer needs. Every individual attendee is listed with their meal choice and dietary notes. Use the search bar to filter by name or dish.",
      },
      {
        heading: "Song Requests tab",
        body: "Every song suggestion left on the RSVP form appears here. Search by guest name or song title, then click \"Export for DJ\" to download the full list as a spreadsheet.",
      },
      {
        heading: "Travel & Lodging tab",
        body: "See at a glance how many guests need shuttle seats and how many plan to book a hotel room. Download the full list with \"Export Logistics\" and share it with your transport provider or hotel coordinator.",
      },
    ],
  },
  {
    id: "section-6",
    icon: MapPin,
    number: "06",
    title: "Seating Plan, Budget & To-Do List",
    content: [
      {
        heading: "Seating plan",
        body: "In the \"Seating Chart\" tab, click \"Add New Table\", give it a name (e.g. \"Bride's Family\"), and set how many seats it has. Your confirmed guests appear in the \"Unseated Guests\" list on the left — just drag a name onto a table to seat them. If you delete a table, those guests simply return to the unseated list. Nothing is lost.",
      },
      {
        heading: "Budget & expenses",
        body: "In the \"Budget\" tab, set your total budget and then add individual expense items — venue, catering, photography, flowers, and so on. Enter what you expect to spend and what you actually paid. A chart shows your spending by category and a progress bar turns yellow as you approach your limit. Click \"Export CSV\" to download your full financial breakdown as a spreadsheet.",
      },
      {
        heading: "Planning checklist",
        body: "Tasks are grouped into five time windows: 12+ Months Out, 6–9 Months Out, 3 Months Out, The Final Month, and Post-Wedding. A circular progress ring shows how much you've ticked off. Mark tasks done, add your own, or delete ones that don't apply to you.",
      },
      {
        heading: "Important: Budget & Checklist stay on this device",
        body: "Your budget and to-do list are saved in your current browser only — they're not stored in the cloud. This keeps your personal finances completely private. But it does mean you won't see this data if you switch to a different browser or device. Your RSVPs, meal data, and seating plan are all saved to the cloud and accessible from anywhere.",
      },
    ],
  },
  {
    id: "section-7",
    icon: QrCode,
    number: "07",
    title: "Sharing Your Link & QR Code",
    content: [
      {
        heading: "Your invitation link is permanent",
        body: "As soon as you create your wedding, a unique invitation link is generated and it never changes. Edit your details, swap the photo, change the theme — the link guests have will always work. Copy it from Dashboard → Overview → Quick Actions and share it anywhere: WhatsApp, email, a wedding website, or printed on a card.",
      },
      {
        heading: "Downloading your QR code",
        body: "Go to Dashboard → Overview → \"View QR Code\". You can download in two formats: PNG (great for digital sharing or standard printing) and SVG (a crisp file that stays sharp at any size — best for printed stationery and signage). Both formats scan perfectly; guests don't need any special app.",
      },
      {
        heading: "Recoloring the QR code in Canva",
        body: "Download the QR code as an SVG file. In Canva, click \"Uploads\" and import the file. Place it on your canvas, click on it, and use the color picker to change its color to match your invitation — blush pink, champagne gold, sage green, anything you like. Because SVG is a vector format, the color change does not affect how well it scans. This is the easiest way to match your QR code perfectly to your printed wedding stationery.",
      },
    ],
  },
]

export function HelpCenterDialog({ open, onOpenChange }: HelpCenterDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[95vw] md:max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 bg-background border border-border shadow-2xl rounded-2xl [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-foreground/35 [scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.2)_transparent] dark:[scrollbar-color:rgba(255,255,255,0.2)_transparent]"
        overlayClassName="bg-black/60 backdrop-blur-sm"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Help Center — Complete Guide</DialogTitle>

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
              Help Center
            </motion.h1>

            <motion.p
              className="text-background/65 text-sm md:text-base leading-relaxed max-w-lg"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.38, delay: 0.28 }}
            >
              Everything you need to know — from creating your invitation to managing your guest list, all in one place.
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
              { label: "Your link never changes.", body: "You can update photos, text, and theme as many times as you like. The link your guests have will always work." },
              { label: "Canva QR recolor tip.", body: "Download the QR code as an SVG, import it into Canva, and use the color picker to match your invitation palette exactly. Quality is never affected." },
              { label: "Each person picks their own meal.", body: "Every member of a guest's group chooses their dish individually — not one choice for the whole table. Your caterer gets exact numbers." },
              { label: "Two children's age groups.", body: "Guests mark children as 0–3 or 3–12 years old, so your venue can plan for infants and young children separately." },
              { label: "Seating plan is saved to the cloud.", body: "Unlike the Budget and To-Do List, your seating chart is saved online and accessible from any device you log in from." },
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

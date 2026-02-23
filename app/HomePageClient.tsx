"use client"

import { EventForm } from "@/components/event-form"
import { HostLoginForm } from "@/components/host-login-form"
import { HelpCenterDialog } from "@/components/help-center-dialog"

import { ThemeToggle } from "@/components/theme-toggle"
import { useState, useCallback, useEffect, useRef } from "react"
import { motion, useInView, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { Shield, Zap, Users, Star, CheckCircle, Sparkles } from "lucide-react"

// ─── Variants ──────────────────────────────────────────────────────────────

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
}

const tabContentVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.99 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -10, scale: 0.99, transition: { duration: 0.22 } },
}

// ─── Word-by-word title ─────────────────────────────────────────────────────

function AnimatedTitle({ text }: { text: string }) {
  const words = text.split(" ")
  return (
    <span>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 28, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 0.3 + i * 0.1,
          }}
          className="inline-block mr-[0.25em] text-gradient-title"
        >
          {word}
        </motion.span>
      ))}
    </span>
  )
}

// ─── Floating particles ─────────────────────────────────────────────────────

type Particle = { id: number; x: number; y: number; size: number; duration: number; delay: number }

function FloatingParticles() {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    setParticles(
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 3,
        duration: 6 + Math.random() * 10,
        delay: Math.random() * 6,
      }))
    )
  }, [])

  if (particles.length === 0) return null

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-foreground/10 dark:bg-foreground/8"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{
            y: [0, -24, 0],
            x: [0, 8, -8, 0],
            opacity: [0.2, 0.7, 0.2],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

// ─── Scroll-reveal wrapper ─────────────────────────────────────────────────

function RevealUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-72px 0px" })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Feature card ───────────────────────────────────────────────────────────

function FeatureCard({
  icon: Icon,
  title,
  description,
  index,
}: {
  icon: any
  title: string
  description: string
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px 0px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36, scale: 0.96 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 36, scale: 0.96 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay: index * 0.1 }}
      className="group relative rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/4 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />
      <div className="relative z-10">
        <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 border border-primary/15 group-hover:scale-110 transition-transform duration-300">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <h3 className="font-semibold text-base mb-1.5">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </motion.div>
  )
}


// ─── Divider with label ─────────────────────────────────────────────────────

function SectionDivider({ label }: { label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-40px 0px" })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scaleX: 0 }}
      animate={inView ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex items-center gap-4 my-2"
    >
      <div className="h-px flex-1 bg-border" />
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest px-2">{label}</span>
      <div className="h-px flex-1 bg-border" />
    </motion.div>
  )
}

// ─── Features data ──────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Sparkles,
    title: "Beautiful Invitations",
    description: "Stunning digital wedding invitations with custom themes, photos, and countdown timers.",
  },
  {
    icon: Users,
    title: "Guest Management",
    description: "Track RSVPs, guest counts, song requests, and travel logistics all in one place.",
  },
  {
    icon: Zap,
    title: "Instant Setup",
    description: "Create your wedding page in minutes. Share a link and start collecting RSVPs immediately.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
      description: "Your wedding data is fully protected. Only guests with your link can access the RSVP page.",
  },
  {
    icon: Star,
    title: "Premium Themes",
    description: "Choose from elegant themes — modern, rustic, dark, floral — to match your style.",
  },
  {
    icon: CheckCircle,
    title: "Budget & Checklist",
    description: "Built-in budget tracker and wedding checklist so you never miss a detail.",
  },
]

// ─── Component ─────────────────────────────────────────────────────────────

export function HomePageClient() {
  const [activeTab, setActiveTab] = useState("create")
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  const { scrollYProgress } = useScroll()
  const headerBg = useTransform(scrollYProgress, [0, 0.05], ["rgba(0,0,0,0)", "rgba(0,0,0,0.04)"])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleTabChange = useCallback((value: string) => setActiveTab(value), [])
  const handleCreateClick = useCallback(() => {
    setActiveTab("create")
    setTimeout(() => {
      document.getElementById("action-section")?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 50)
  }, [])
  const handleLoginClick = useCallback(() => {
    setActiveTab("login")
    setTimeout(() => {
      document.getElementById("action-section")?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 50)
  }, [])
  const handleSwitchToCreate = useCallback(() => setActiveTab("create"), [])

  useEffect(() => {
    const handleSwitchToLogin = () => setActiveTab("login")
    window.addEventListener("switchToHostLogin", handleSwitchToLogin)
    return () => window.removeEventListener("switchToHostLogin", handleSwitchToLogin)
  }, [])

  return (
    <div className="min-h-screen hero-gradient relative">
      <FloatingParticles />

      {/* Fixed Header */}
      <motion.header
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        style={{ backgroundColor: headerBg }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-border/60 transition-colors"
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <motion.button
              onClick={() => setIsHelpOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="help-btn group relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium overflow-hidden"
            >
              {/* Glow ring */}
              <span className="pointer-events-none absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-violet-500/20 via-rose-400/20 to-amber-400/20 blur-sm" />
              {/* Border gradient */}
              <span className="pointer-events-none absolute inset-0 rounded-full border border-transparent bg-clip-padding" style={{ background: "linear-gradient(var(--help-bg,hsl(var(--background))),hsl(var(--background))) padding-box, linear-gradient(135deg,hsl(var(--foreground)/0.25),hsl(var(--foreground)/0.08)) border-box" }} />
              {/* Shimmer sweep */}
              <span className="pointer-events-none absolute inset-0 rounded-full -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              {/* Pulse dot */}
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
              </span>
              <span className="relative text-foreground/80 group-hover:text-foreground transition-colors duration-200 tracking-wide">Help</span>
              {/* Question mark icon */}
              <span className="relative flex items-center justify-center h-5 w-5 rounded-full bg-foreground/8 group-hover:bg-foreground/14 transition-colors duration-200 text-foreground/60 group-hover:text-foreground/90 text-xs font-bold">?</span>
            </motion.button>
          <ThemeToggle />
        </div>
      </motion.header>

      <HelpCenterDialog open={isHelpOpen} onOpenChange={setIsHelpOpen} />

      <main
        className={`container mx-auto px-4 pt-28 pb-20 relative z-10 transition-all duration-300 ${isHelpOpen ? "blur-sm" : "blur-0"}`}
        role="main"
      >
        <div className="mx-auto max-w-3xl space-y-16">

            {/* ── Hero Banner ─────────────────────────────────────── */}
            <section className="text-center space-y-8">

              {/* Banner card */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="hero-banner relative overflow-hidden rounded-2xl border border-border/60 px-8 py-12 sm:py-16"
              >
                {/* Decorative rings */}
                <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full border border-foreground/5 dark:border-foreground/8" />
                <div className="pointer-events-none absolute -top-16 -left-16 h-48 w-48 rounded-full border border-foreground/5 dark:border-foreground/8" />
                <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full border border-foreground/5 dark:border-foreground/8" />
                <div className="pointer-events-none absolute -bottom-16 -right-16 h-52 w-52 rounded-full border border-foreground/5 dark:border-foreground/8" />

                {/* Glowing orbs */}
                <div className="pointer-events-none absolute top-0 left-1/4 h-40 w-40 -translate-y-1/2 rounded-full bg-foreground/5 blur-3xl dark:bg-white/6" />
                <div className="pointer-events-none absolute bottom-0 right-1/4 h-40 w-40 translate-y-1/2 rounded-full bg-foreground/5 blur-3xl dark:bg-white/6" />

                {/* Heading */}
                <h1 className="relative z-10 text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.1] pb-3">
                  <AnimatedTitle text="Premium Wedding RSVP & Planner" />
                </h1>

                {/* Subheading */}
                <motion.p
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.75 }}
                  className="relative z-10 mt-4 text-base text-muted-foreground text-balance max-w-md mx-auto"
                >
                  The all-in-one digital invitation and guest management platform for your big day.
                </motion.p>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay: 1.0 }}
                className="grid grid-cols-2 gap-4 w-full max-w-md mx-auto"
              >
                {/* Create New Wedding — primary dark fill */}
                <motion.div
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative"
                >
                  {/* Soft ambient halo */}
                  <div className="pointer-events-none absolute -inset-1 rounded-xl bg-foreground/15 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <button
                    type="button"
                    onClick={handleCreateClick}
                    className="hero-cta-primary relative w-full h-11 px-6 rounded-xl text-sm font-semibold tracking-wide"
                  >
                    <span className="relative flex items-center justify-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 opacity-80" />
                      Create New Wedding
                    </span>
                  </button>
                </motion.div>

                {/* Host Login — glass ghost */}
                <motion.div
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative"
                >
                  <button
                    type="button"
                    onClick={handleLoginClick}
                    className="hero-cta-ghost relative w-full h-11 px-6 rounded-xl text-sm font-semibold tracking-wide"
                  >
                    <span className="relative flex items-center justify-center gap-2">
                      <Shield className="h-3.5 w-3.5 opacity-70" />
                      Host Login
                    </span>
                  </button>
                </motion.div>
              </motion.div>
            </section>

            {/* ── Features ───────────────────────────────────────── */}
          <section>
            <SectionDivider label="What's included" />
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURES.map((f, i) => (
                <FeatureCard key={f.title} icon={f.icon} title={f.title} description={f.description} index={i} />
              ))}
            </div>
          </section>

          {/* ── Action Form ────────────────────────────────────── */}
            <section id="action-section">
              <SectionDivider label="Get started" />
              <RevealUp delay={0.05} className="mt-8">
                <div className="w-full">
                  <AnimatePresence mode="wait">
                    {activeTab === "create" && (
                      <motion.div
                        key="create"
                        variants={tabContentVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <EventForm />
                      </motion.div>
                    )}
                    {activeTab === "login" && (
                      <motion.div
                        key="login"
                        variants={tabContentVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="space-y-6"
                      >
                        <HostLoginForm onSwitchToCreate={handleSwitchToCreate} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </RevealUp>
            </section>

        </div>
      </main>
    </div>
  )
}

"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface EventCountdownProps {
    eventDate: string
}

function getTimeRemaining(targetDate: Date) {
    const now = new Date()
    const diff = targetDate.getTime() - now.getTime()

    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
    const minutes = Math.floor((diff / (1000 * 60)) % 60)
    const seconds = Math.floor((diff / 1000) % 60)

    return { days, hours, minutes, seconds, isOver: false }
}

function CountdownDigit({ value, label }: { value: number; label: string }) {
    const displayValue = String(value).padStart(2, "0")
    const prevValueRef = useRef(displayValue)

    useEffect(() => {
        prevValueRef.current = displayValue
    }, [displayValue])

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative w-[72px] h-[80px] sm:w-[88px] sm:h-[96px] bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
                {/* Subtle inner glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5 pointer-events-none" />

                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={displayValue}
                        initial={{ y: -24, opacity: 0, filter: "blur(4px)" }}
                        animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                        exit={{ y: 24, opacity: 0, filter: "blur(4px)" }}
                        transition={{ type: "spring", stiffness: 300, damping: 28 }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <span className="text-3xl sm:text-4xl font-bold tabular-nums text-primary tracking-tight">
                            {displayValue}
                        </span>
                    </motion.div>
                </AnimatePresence>
            </div>
            <span className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-widest">
                {label}
            </span>
        </div>
    )
}

function Separator() {
    return (
        <div className="flex flex-col items-center justify-center h-[80px] sm:h-[96px] px-1">
            <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="text-2xl sm:text-3xl font-bold text-primary/60"
            >
                :
            </motion.span>
        </div>
    )
}

export function EventCountdown({ eventDate }: EventCountdownProps) {
    const [timeLeft, setTimeLeft] = useState(() => {
        const target = new Date(eventDate.replace(" ", "T"))
        return getTimeRemaining(target)
    })
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const target = new Date(eventDate.replace(" ", "T"))

        const tick = () => setTimeLeft(getTimeRemaining(target))
        tick()

        const interval = setInterval(tick, 1000)
        return () => clearInterval(interval)
    }, [eventDate])

    // Don't render if event is over or not mounted
    if (!mounted || timeLeft.isOver) return null

    return (
        <motion.section
            aria-label="Wedding countdown"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
            <div className="relative bg-card border border-border/80 rounded-3xl shadow-sm overflow-hidden p-6 sm:p-8">
                {/* Decorative background pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary))_0%,transparent_50%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--primary))_0%,transparent_50%)]" />
                </div>

                <div className="relative z-10">
                    {/* Header */}
                    <div className="text-center mb-6 sm:mb-8">
                        <motion.p
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-sm sm:text-base font-medium text-primary uppercase tracking-[0.2em]"
                        >
                            Counting Down To
                        </motion.p>
                        <motion.p
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-xs sm:text-sm text-muted-foreground mt-1"
                        >
                            The Big Day
                        </motion.p>
                    </div>

                    {/* Countdown digits */}
                    <div className="flex items-start justify-center gap-1 sm:gap-2">
                        <CountdownDigit value={timeLeft.days} label="Days" />
                        <Separator />
                        <CountdownDigit value={timeLeft.hours} label="Hours" />
                        <Separator />
                        <CountdownDigit value={timeLeft.minutes} label="Mins" />
                        <Separator />
                        <CountdownDigit value={timeLeft.seconds} label="Secs" />
                    </div>
                </div>
            </div>
        </motion.section>
    )
}

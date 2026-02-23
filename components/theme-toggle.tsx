"use client"

import { useState, useEffect } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"

export function ThemeToggle({ inline = false }: { inline?: boolean }) {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className={inline ? "h-7 w-[44px]" : "fixed top-4 right-4 z-50 h-7 w-[44px]"} />
  }

  const handleThemeToggle = () => {
    const newTheme = theme === "dark" ? "modern" : "dark"
    if (typeof document !== "undefined" && "startViewTransition" in document) {
      ; (document as any).startViewTransition(() => setTheme(newTheme))
    } else {
      setTheme(newTheme)
    }
  }

  const button = (
    <button
      onClick={handleThemeToggle}
      className="relative h-7 w-[44px] rounded-full bg-muted/60 border border-border/50 transition-colors duration-300 focus:outline-none shadow-lg backdrop-blur-sm"
      aria-label="Toggle theme"
    >
      <motion.div
        className="absolute top-[3px] h-[22px] w-[22px] rounded-full bg-background shadow-sm flex items-center justify-center"
        animate={{ x: theme === "dark" ? 18 : 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <Sun className="h-3 w-3 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
        <Moon className="absolute h-3 w-3 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
      </motion.div>
    </button>
  )

  if (inline) return button

  return (
    <motion.div
      className="fixed top-4 right-4 z-50"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      {button}
    </motion.div>
  )
}

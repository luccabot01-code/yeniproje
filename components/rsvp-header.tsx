"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"

export function RSVPHeader() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"

  const handleThemeToggle = () => {
    const newTheme = isDark ? "modern" : "dark"

    // View Transition API support check
    if (typeof document !== "undefined" && "startViewTransition" in document) {
      ; (document as any).startViewTransition(() => {
        setTheme(newTheme)
      })
    } else {
      setTheme(newTheme)
    }
  }

  return (
    <div className="flex items-center justify-end gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <button
        onClick={handleThemeToggle}
        className="relative h-8 w-16 rounded-full bg-muted border-2 border-border transition-colors duration-300 hover:bg-muted/80 focus:outline-none focus-visible:outline-none"
        aria-label="Toggle theme"
      >
        {/* Toggle circle */}
        <motion.div
          className="absolute top-0.5 h-6 w-6 rounded-full bg-background border border-border shadow-md flex items-center justify-center"
          animate={{
            x: isDark ? 30 : 2,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        >
          <Sun className="h-3.5 w-3.5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-foreground" />
          <Moon className="absolute h-3.5 w-3.5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-foreground" />
        </motion.div>

        <span className="sr-only">Toggle theme</span>
      </button>
    </div>
  )
}

"use client"

import { ArrowLeft, Sun, Moon } from "lucide-react"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import Link from "next/link"

export function RSVPHeader({ slug }: { slug: string }) {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center justify-between">
      <Link
        href={`/dashboard/${slug}`}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200 active:scale-95"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <TooltipProvider>
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="bg-transparent shadow-[0_0_35px_rgba(0,0,0,0.5)] hover:shadow-[0_0_45px_rgba(0,0,0,0.7)] dark:shadow-[0_0_35px_rgba(251,191,36,0.6)] dark:hover:shadow-[0_0_50px_rgba(251,191,36,0.8)] hover:scale-105 active:scale-95 transition-all duration-300"
              aria-label="Toggle theme"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Dark / Light</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

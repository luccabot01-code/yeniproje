"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

export function DemoBadge() {
  return (
    <div className="fixed bottom-5 right-5 z-[9998]">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white text-black text-xs font-semibold tracking-wide shadow-[0_8px_30px_rgba(0,0,0,0.35)] border border-black/10 select-none"
      >
        <span className="relative flex h-2 w-2 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        <Sparkles className="h-3 w-3 opacity-80" />
        Live Demo
      </motion.div>
    </div>
  )
}

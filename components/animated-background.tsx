"use client"

import { memo } from "react"

export const AnimatedBackground = memo(function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Top-left warm blush */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,oklch(0.88_0.04_10/0.18)_0%,transparent_70%)]" />

      {/* Bottom-right warm rose */}
      <div className="absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,oklch(0.82_0.06_5/0.14)_0%,transparent_65%)]" />

      {/* Center subtle warmth */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,oklch(0.93_0.03_60/0.1)_0%,transparent_70%)]" />

      {/* Dark mode overrides */}
      <div className="hidden dark:block absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,oklch(0.35_0.05_340/0.15)_0%,transparent_70%)]" />
      <div className="hidden dark:block absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,oklch(0.3_0.04_20/0.12)_0%,transparent_65%)]" />
    </div>
  )
})

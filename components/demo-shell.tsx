"use client"

import { useState, useCallback } from "react"
import { UpsellModal } from "@/components/upsell-modal"
import { DemoBadge } from "@/components/demo-badge"
import { DemoProvider } from "@/lib/demo-context"

export function DemoShell({ children }: { children: React.ReactNode }) {
  const [upsellOpen, setUpsellOpen] = useState(false)
  const showUpsell = useCallback(() => setUpsellOpen(true), [])
  const closeUpsell = useCallback(() => setUpsellOpen(false), [])

  return (
    <DemoProvider onUpsell={showUpsell}>
      {children}
      <DemoBadge />
      <UpsellModal open={upsellOpen} onClose={closeUpsell} />
    </DemoProvider>
  )
}

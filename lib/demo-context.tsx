"use client"

import React, { createContext, useContext, useState, useCallback } from "react"

interface DemoContextValue {
  showUpsell: () => void
}

const DemoContext = createContext<DemoContextValue>({ showUpsell: () => {} })

export function useDemoUpsell() {
  return useContext(DemoContext)
}

export function DemoProvider({
  children,
  onUpsell,
}: {
  children: React.ReactNode
  onUpsell: () => void
}) {
  return (
    <DemoContext.Provider value={{ showUpsell: onUpsell }}>
      {children}
    </DemoContext.Provider>
  )
}

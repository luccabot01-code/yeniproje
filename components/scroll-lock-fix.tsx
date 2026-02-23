"use client"

import { useEffect } from "react"

export function ScrollLockFix() {
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const body = document.body
      if (body.style.overflow === "hidden" || body.style.overflowY === "hidden") {
        body.style.removeProperty("overflow")
        body.style.removeProperty("overflow-y")
      }
      if (body.style.paddingRight) {
        body.style.removeProperty("padding-right")
      }
      if (body.style.marginRight) {
        body.style.removeProperty("margin-right")
      }
    })

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["style"],
    })

    return () => observer.disconnect()
  }, [])

  return null
}

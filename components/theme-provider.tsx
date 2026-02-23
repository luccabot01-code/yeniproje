"use client"
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes"
import { useEffect } from "react"

export { useTheme } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  useEffect(() => {
    // Enable view transitions for theme changes
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      const style = document.createElement('style')
      style.textContent = `
        ::view-transition-old(root),
        ::view-transition-new(root) {
          animation-duration: 0.4s;
          animation-timing-function: ease-in-out;
        }
      `
      document.head.appendChild(style)
    }
  }, [])

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

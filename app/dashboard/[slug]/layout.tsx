import type React from "react"
import type { Viewport } from "next"
import Script from "next/script"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        id="prevent-zoom"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              // Prevent zoom gestures immediately
              document.addEventListener('gesturestart', function(e) {
                e.preventDefault();
              }, { passive: false });
              
              document.addEventListener('gesturechange', function(e) {
                e.preventDefault();
              }, { passive: false });
              
              document.addEventListener('gestureend', function(e) {
                e.preventDefault();
              }, { passive: false });
              
              // Additional prevention for multi-touch
              var lastTouchDistance = 0;
              document.addEventListener('touchstart', function(e) {
                if (e.touches.length > 1) {
                  e.preventDefault();
                }
              }, { passive: false });
              
              document.addEventListener('touchmove', function(e) {
                if (e.touches.length > 1) {
                  e.preventDefault();
                }
              }, { passive: false });
            })();
          `,
        }}
      />
      {children}
    </>
  )
}

import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { ScrollLockFix } from "@/components/scroll-lock-fix"
import { inter } from "@/lib/fonts"
import "./globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-geist-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://v0-digital-invitation-platform-lemon.vercel.app"),
  title: {
      default: "Flor & Montana - Premium Wedding Invitations & RSVP",
    template: "%s | Flor & Montana",
  },
    description:
      "Create beautiful digital wedding invitations with seamless RSVP management. Premium, easy to use, and mobile-friendly.",
    keywords: [
      "RSVP",
      "digital wedding invitation",
      "wedding RSVP",
      "wedding management",
      "wedding invitation",
      "online wedding RSVP",
      "wedding guest management",
    ],
  authors: [{ name: "Flor & Montana" }],
  creator: "Flor & Montana",
  publisher: "Flor & Montana",
  generator: "v0.app",
  applicationName: "Flor & Montana Invitation",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Flor & Montana",
      title: "Flor & Montana - Premium Wedding Invitations & RSVP",
      description: "Create beautiful digital wedding invitations with seamless RSVP management.",
      images: [
        {
          url: "/icon.png",
          width: 1200,
          height: 1200,
          alt: "Flor & Montana",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Flor & Montana - Premium Wedding Invitations & RSVP",
      description: "Create beautiful digital wedding invitations with seamless RSVP management.",
    images: ["/icon.png"],
    creator: "@flormontana",
  },
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: [{ url: "/favicon.png", type: "image/png" }],
    shortcut: "/favicon.png",
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  interactiveWidget: "resizes-content",
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#252525" },
  ],
  colorScheme: "light dark",
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Flor & Montana Invitation",
    description:
      "Create beautiful digital wedding invitations with seamless RSVP management. Premium and mobile-friendly.",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "1250",
  },
}

// Trigger Rebuild
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} font-sans antialiased`} suppressHydrationWarning>
          <ThemeProvider attribute="class" defaultTheme="modern" storageKey="rsvp-theme-preference" enableSystem={false}>
            <ScrollLockFix />
            {children}
          </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}

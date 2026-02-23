import type { Metadata } from "next"
import { HomePageClient } from "./HomePageClient"

export const metadata: Metadata = {
  title: "Create Your Wedding - Premium Wedding RSVP Platform",
  description:
    "Create beautiful digital wedding invitations with seamless RSVP management. Premium, easy to use, and mobile-friendly.",
}

export default function HomePage() {
  return <HomePageClient />
}

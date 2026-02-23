import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { Event } from "@/lib/types"
import type { Metadata } from "next"
import { RSVPPageClient } from "@/components/rsvp-page-client"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from("events")
    .select("title, event_type, cover_image_url, media_type")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (!event) {
    return {
      title: "Event Not Found",
    }
  }

  return {
    title: `RSVP - ${event.title}`,
    description: `You're invited to ${event.title}. Please RSVP to let us know if you can attend.`,
    openGraph: {
      title: `RSVP - ${event.title}`,
      description: `You're invited! Please RSVP for ${event.title}`,
      images: event.cover_image_url ? [{ url: event.cover_image_url }] : [],
    },
    robots: {
      index: false,
      follow: false,
    },
  }
}

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function RSVPPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (error || !event) {
    notFound()
  }

  return <RSVPPageClient event={event as Event} />
}

import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { EventEditForm } from "@/components/event-edit-form"
import { ThemeToggle } from "@/components/theme-toggle"
import type { Event } from "@/lib/types"
import { getDashboardSession } from "@/lib/auth/session"

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function EditEventPage({ params }: PageProps) {
  const { slug } = await params
  const email = await getDashboardSession(slug)

  const supabase = await createClient()

  // Fetch event
  const { data: event, error: eventError } = await supabase.from("events").select("*").eq("slug", slug).single()

  if (eventError || !event) {
    notFound()
  }

  // Simple email verification
  if (!email || email !== event.host_email) {
    redirect(`/verify?slug=${slug}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <ThemeToggle />
      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl space-y-8 animate-fade-in-up">
          <header className="text-center space-y-4">
              <h1 className="text-5xl font-bold tracking-tight text-balance">Edit Wedding</h1>
              <p className="text-xl text-muted-foreground text-balance">Update your wedding details</p>
          </header>

          <EventEditForm event={event as Event} />
        </div>
      </main>
    </div>
  )
}

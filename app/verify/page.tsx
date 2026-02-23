"use client"

import type React from "react"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { verifyAndCreateSession, verifyEmailAndGetEvents } from "./actions"
import { EventSelectorDialog } from "@/components/event-selector-dialog"
import type { Event } from "@/lib/types"

function VerifyForm() {
  const searchParams = useSearchParams()
  const slug = searchParams.get("slug")

  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showEventSelector, setShowEventSelector] = useState(false)
  const [userEvents, setUserEvents] = useState<
    Pick<Event, "id" | "slug" | "title" | "event_type" | "date" | "cover_image_url">[]
  >([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    setError("")

    try {
      const result = await verifyEmailAndGetEvents(email, slug || undefined)

      if (result?.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }

      if (result?.events) {
        if (result.events.length === 1) {
          const singleEvent = result.events[0]
          await verifyAndCreateSession(singleEvent.slug, email)
        } else {
          setUserEvents(result.events)
          setShowEventSelector(true)
          setIsLoading(false)
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  const handleEventSelect = async (slug: string) => {
    await verifyAndCreateSession(slug, email)
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Dashboard</CardTitle>
              <CardDescription>Enter your email to access your wedding dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={isLoading}
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="create-wedding-btn w-full py-3 px-6 rounded-xl text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10">
                    {isLoading ? "Verifying..." : "Access Dashboard"}
                  </span>
                </button>
            </form>
          </CardContent>
        </Card>
      </div>

      {showEventSelector && (
        <EventSelectorDialog
          open={showEventSelector}
          events={userEvents}
          email={email}
          onSelectEvent={handleEventSelect}
        />
      )}
    </>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyForm />
    </Suspense>
  )
}
